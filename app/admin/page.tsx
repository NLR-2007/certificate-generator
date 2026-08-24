"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, FileCheck, Upload, Layout, ShieldAlert, Plus, Search, LogOut, CheckCircle2, Download, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"participants" | "certificates" | "templates" | "import">("participants");
  const [authed, setAuthed] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin Quick Generator State
  const [adminGenId, setAdminGenId] = useState("");
  const [adminGenName, setAdminGenName] = useState("");
  const [needsName, setNeedsName] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    participantName: string;
    certificateId: string;
    pdfBase64: string;
  } | null>(null);

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    importedCount: number;
    createdCount?: number;
    updatedCount?: number;
    rejectedCount: number;
    rejectedCsv?: string | null;
  } | null>(null);

  // Participants and certificates are read from the server so the dashboard
  // reflects CSV imports and previously issued certificates, not a static list.
  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [participantsRes, certificatesRes] = await Promise.all([
        fetch("/api/admin/participants"),
        fetch("/api/admin/certificates"),
      ]);

      if (participantsRes.status === 401 || certificatesRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!participantsRes.ok || !certificatesRes.ok) {
        throw new Error("Could not load admin data.");
      }

      const participantsData = await participantsRes.json();
      const certificatesData = await certificatesRes.json();

      setParticipants(participantsData.participants || []);
      setCertificates(certificatesData.certificates || []);
    } catch {
      setLoadError("Could not load the participant database. Please refresh and try again.");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

    // The session cookie is httpOnly, so authentication is confirmed server-side.
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((session) => {
        if (cancelled) return;
        if (!session.authenticated) {
          router.push("/admin/login");
          return;
        }
        setAuthed(true);
        loadData();
      })
      .catch(() => {
        if (!cancelled) router.push("/admin/login");
      });

    return () => {
      cancelled = true;
    };
  }, [router, loadData]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  // Admins issue through the admin endpoint, which accepts any registration ID -
  // including ones not in the roster (given a name) and participants flagged
  // ineligible. The public endpoint keeps its restrictions.
  const handleAdminGenerateCertificate = async (regIdToGen: string, nameOverride?: string) => {
    const cleanId = regIdToGen.trim();
    if (!cleanId) return;

    setGeneratingId(cleanId);
    setGeneratedResult(null);
    setGenerateError(null);

    try {
      const res = await fetch("/api/admin/certificates/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: cleanId,
          ...(nameOverride?.trim() ? { participantName: nameOverride.trim() } : {}),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        // The roll number is unknown - prompt for a name instead of failing.
        if (data.needsName) setNeedsName(true);
        throw new Error(data.error || "Failed to generate certificate.");
      }

      setNeedsName(false);

      const participantName = data.participantName || cleanId;

      setGeneratedResult({
        participantName,
        certificateId: data.certificateId,
        pdfBase64: data.pdfBase64,
      });

      // A brand new roll number was added to the roster - reload it.
      if (data.participantCreated) {
        loadData();
      }

      // Update participant list state
      setParticipants((prev) =>
        prev.map((p) =>
          p.registration_id === cleanId
            ? { ...p, certificate_generated: true, certificate_id: data.certificateId }
            : p
        )
      );

      // Add to issued certificates table
      setCertificates((prev) => [
        {
          certificate_id: data.certificateId,
          participant_name: participantName,
          registration_id: cleanId,
          issue_date: new Date().toISOString(),
          status: "VALID",
        },
        ...prev.filter((c) => c.certificate_id !== data.certificateId),
      ]);
    } catch (err: any) {
      setGenerateError(err.message || "Certificate Generation Error");
    } finally {
      setGeneratingId(null);
    }
  };

  const handleToggleRevoke = async (certId: string, currentStatus: string) => {
    const newStatus = currentStatus === "VALID" ? "REVOKED" : "VALID";
    try {
      const res = await fetch("/api/admin/certificates/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId: certId, status: newStatus }),
      });
      if (res.ok) {
        setCertificates((prev) =>
          prev.map((c) => (c.certificate_id === certId ? { ...c, status: newStatus } : c))
        );
        return;
      }

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json().catch(() => ({}));
      alert(data.error || "Could not update the certificate status.");
    } catch {
      alert("Could not reach the server to update the certificate status.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setImportResult(data);
        await loadData();
      } else if (res.status === 401) {
        router.push("/admin/login");
      } else {
        alert(data.error || "CSV Import Failed");
      }
    } catch {
      alert("CSV Import Error");
    } finally {
      setImporting(false);
      // Clear the input so re-selecting the same file fires onChange again.
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!authed) return null;

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.team_name && p.team_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">KLH ED Cell Administration</span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white heading-font">Admin Portal</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="success" className="px-3 py-1 text-xs">
            Admin Authenticated
          </Badge>
          <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950">
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl p-4 text-sm">
          {loadError}
        </div>
      )}

      {/* ADMIN DIRECT CERTIFICATE GENERATOR WIDGET */}
      <Card className="border-blue-500/30 bg-white/90 dark:bg-slate-900/90 shadow-xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            Admin Certificate Generation Hub
          </CardTitle>
          <CardDescription>
            Directly generate official PDF certificates for any registered student.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdminGenerateCertificate(adminGenId, adminGenName);
            }}
            className="space-y-3"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Enter Registration ID / Roll Number (e.g. 2520090002)..."
                value={adminGenId}
                onChange={(e) => {
                  setAdminGenId(e.target.value);
                  setNeedsName(false);
                  setGenerateError(null);
                }}
                className="flex-1"
              />
              <Button
                type="submit"
                isLoading={generatingId === adminGenId && !!adminGenId}
                className="bg-slate-900 dark:bg-white text-white dark:text-black font-bold px-6 hover:bg-slate-800 dark:hover:bg-gray-200"
              >
                <FileCheck className="w-4 h-4 mr-2 text-blue-300 dark:text-blue-600" />
                Generate Certificate
              </Button>
            </div>

            <Input
              placeholder="Participant name (optional - overrides the name on file)"
              value={adminGenName}
              onChange={(e) => setAdminGenName(e.target.value)}
              error={needsName ? "This roll number is not on file. Enter a name to issue anyway." : undefined}
              helperText={
                needsName
                  ? undefined
                  : "Leave blank to use the official name from the database. Admins may issue for any roll number, eligible or not."
              }
            />

            {generateError && !needsName && (
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{generateError}</p>
            )}
          </form>

          {/* GENERATED CERTIFICATE PREVIEW MODAL / BANNER */}
          {generatedResult && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-700 dark:text-emerald-300">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Certificate Generated for {generatedResult.participantName}</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Certificate ID: <strong className="font-mono text-slate-900 dark:text-white">{generatedResult.certificateId}</strong></p>
                </div>
                <a
                  href={`data:application/pdf;base64,${generatedResult.pdfBase64}`}
                  download={`${generatedResult.participantName.replace(/\s+/g, "_")}_SIH2026.pdf`}
                >
                  <Button variant="success" size="sm" className="font-bold">
                    <Download className="w-4 h-4 mr-1.5" />
                    Download Generated PDF
                  </Button>
                </a>
              </div>

              <div className="w-full h-80 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-950">
                <iframe
                  src={`data:application/pdf;base64,${generatedResult.pdfBase64}#toolbar=0`}
                  className="w-full h-full"
                  title="Admin Certificate Preview"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Participants</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{participants.length}</p>
          <span className="text-[10px] text-slate-500">Official Database Records</span>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Eligible</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {participants.filter((p) => p.eligible).length}
          </p>
          <span className="text-[10px] text-slate-500">Approved for certificate</span>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Generated</span>
            <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {participants.filter((p) => p.certificate_generated).length}
          </p>
          <span className="text-[10px] text-slate-500">Certificates issued</span>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revoked</span>
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono">
            {certificates.filter((c) => c.status === "REVOKED").length}
          </p>
          <span className="text-[10px] text-slate-500">Invalidated records</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "participants"
              ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "certificates"
              ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Issued Certificates ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "templates"
              ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Template Coordinates</span>
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "import"
              ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-300 dark:border-slate-700"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>CSV Import</span>
        </button>
      </div>

      {/* TAB 1: PARTICIPANTS WITH DIRECT ADMIN GENERATE ACTION */}
      {activeTab === "participants" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Approved SIH 2026 Participant Database ({participants.length} Records)</CardTitle>
              <CardDescription>Search participants or click Generate Certificate to produce PDF.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search name, roll ID or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 text-xs"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Registration ID</th>
                    <th className="px-4 py-3">Participant Name</th>
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">Eligibility</th>
                    <th className="px-4 py-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white/60 dark:bg-slate-900/40">
                  {filteredParticipants.slice(0, 100).map((p) => (
                    <tr key={p.registration_id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{p.registration_id}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.team_name || "SIH 2026 Team"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.eligible ? "success" : "danger"}>
                          {p.eligible ? "Approved" : "Ineligible"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          isLoading={generatingId === p.registration_id}
                          onClick={() => handleAdminGenerateCertificate(p.registration_id)}
                          className="text-[11px] py-1 px-3 bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:bg-slate-800 dark:hover:bg-gray-200"
                        >
                          <FileCheck className="w-3.5 h-3.5 mr-1 text-blue-300 dark:text-blue-600" />
                          Generate Certificate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredParticipants.length > 100 && (
                <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                  Showing top 100 matching records out of {filteredParticipants.length}. Use search input to filter.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CERTIFICATES & REVOCATION */}
      {activeTab === "certificates" && (
        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates & Revocation Controls</CardTitle>
            <CardDescription>View issued certificates or invalidate revoked records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Participant Name</th>
                    <th className="px-4 py-3">Registration ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white/60 dark:bg-slate-900/40">
                  {certificates.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No certificates generated yet in this session. Use the Generate Certificate button above.
                      </td>
                    </tr>
                  ) : (
                    certificates.map((c) => (
                      <tr key={c.certificate_id} className="hover:bg-slate-100 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{c.certificate_id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{c.participant_name}</td>
                        <td className="px-4 py-3 font-mono">{c.registration_id}</td>
                        <td className="px-4 py-3">
                          <Badge variant={c.status === "VALID" ? "success" : "danger"}>
                            {c.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <a
                            href={`/verify/${c.certificate_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline mr-2"
                          >
                            Verify Page
                          </a>
                          <Button
                            size="sm"
                            variant={c.status === "VALID" ? "danger" : "success"}
                            onClick={() => handleToggleRevoke(c.certificate_id, c.status)}
                            className="text-[11px] py-1 px-2.5"
                          >
                            {c.status === "VALID" ? "Revoke" : "Restore"}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: TEMPLATES */}
      {activeTab === "templates" && (
        <Card>
          <CardHeader>
            <CardTitle>Template System & Overlay Coordinates</CardTitle>
            <CardDescription>Adjust dynamic overlay positions for PDF rendering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Official Template: SIH-participation-template.pdf</h4>
                <p className="text-slate-600 dark:text-slate-400">KLH University SIH 2026 Participation Certificate Artwork</p>
                <Badge variant="success">Active PDF Template</Badge>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm font-mono">Dynamic Elements Overlay</h4>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                  <li>• <strong>Participant Name:</strong> Centered at Y = 253pt (Auto-fitting font scale)</li>
                  <li>• <strong>Certificate ID:</strong> Bottom-left margin (SIH26-XXXXXX)</li>
                  <li>• <strong>Issue Date:</strong> Embedded timestamp</li>
                  <li>• <strong>QR Code:</strong> 46x46pt embedded PNG</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CSV IMPORT */}
      {activeTab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Participant CSV Import</CardTitle>
            <CardDescription>Upload a CSV spreadsheet with participant registration records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 bg-slate-100 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
              <Upload className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Select or drag your CSV file</p>
                <p className="text-xs text-slate-500 font-mono">Headers: registration_id, name, email, department, college, eligible</p>
              </div>

              <div className="inline-block">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  size="md"
                  isLoading={importing}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold"
                >
                  Browse & Upload CSV
                </Button>
              </div>
            </div>

            {importResult && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">CSV Import Summary</h4>
                <div className="flex items-center space-x-4 text-xs">
                  <Badge variant="info">Total: {importResult.totalRows}</Badge>
                  <Badge variant="success">Imported: {importResult.importedCount}</Badge>
                  {typeof importResult.createdCount === "number" && (
                    <Badge variant="info">
                      New: {importResult.createdCount} / Updated: {importResult.updatedCount ?? 0}
                    </Badge>
                  )}
                  <Badge variant={importResult.rejectedCount > 0 ? "danger" : "neutral"}>
                    Rejected: {importResult.rejectedCount}
                  </Badge>
                </div>

                {importResult.rejectedCsv && (
                  <div className="pt-2">
                    <a
                      href={`data:text/csv;charset=utf-8,${encodeURIComponent(importResult.rejectedCsv)}`}
                      download="rejected_participants.csv"
                    >
                      <Button variant="outline" size="sm" className="text-xs text-red-600 dark:text-red-400 border-red-500/30">
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Download Rejected Rows CSV ({importResult.rejectedCount})
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
