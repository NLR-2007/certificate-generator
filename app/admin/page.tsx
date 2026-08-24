"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, FileCheck, Upload, Layout, ShieldAlert, Plus, Search, LogOut, CheckCircle2, Download, Eye, Sparkles, FileSpreadsheet, Trash2, Edit, Save, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { fetchJson } from "@/lib/utils/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { CertificateRecord, FormConfig, FormField, FormSubmission } from "@/lib/db/mock-store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"participants" | "certificates" | "form" | "templates" | "import">("participants");
  const [authed, setAuthed] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [participants, setParticipants] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Builder & Submissions State
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>([]);
  const [savingForm, setSavingForm] = useState(false);
  const [formSaveSuccess, setFormSaveSuccess] = useState(false);
  const [formSearch, setFormSearch] = useState("");

  // New Field State
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<FormField["type"]>("text");
  const [newFieldReq, setNewFieldReq] = useState(true);
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState("");
  const [newFieldOptions, setNewFieldOptions] = useState("");

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

  const [syncingSheet, setSyncingSheet] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    importedCount: number;
    createdCount?: number;
    updatedCount?: number;
    rejectedCount: number;
    rejectedCsv?: string | null;
  } | null>(null);

  const handleSyncSheet = async () => {
    setSyncingSheet(true);
    setSyncMessage(null);
    try {
      const data = await fetchJson<any>("/api/admin/sync-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl: formConfig?.googleSheetUrl }),
      });
      setSyncMessage(data.message || "Sheet synced successfully!");
      await loadData();
    } catch (err: any) {
      setSyncMessage(err.message || "Failed to sync sheet.");
    } finally {
      setSyncingSheet(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [participantsRes, certificatesRes, formRes] = await Promise.all([
        fetch("/api/admin/participants"),
        fetch("/api/admin/certificates"),
        fetch("/api/admin/form"),
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
      const formData = await formRes.json();

      setParticipants(participantsData.participants || []);
      setCertificates(certificatesData.certificates || []);

      if (formData.success) {
        setFormConfig(formData.config);
        setFormSubmissions(formData.submissions || []);
      }
    } catch {
      setLoadError("Could not load the participant database. Please refresh and try again.");
    }
  }, [router]);

  useEffect(() => {
    let cancelled = false;

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

    const interval = setInterval(() => {
      if (!cancelled) loadData();
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
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

      if (data.participantCreated) {
        loadData();
      }

      setParticipants((prev) =>
        prev.map((p) =>
          p.registration_id === cleanId
            ? { ...p, certificate_generated: true, certificate_id: data.certificateId }
            : p
        )
      );

      setCertificates((prev) => [
        {
          certificate_id: data.certificateId,
          participant_name: participantName,
          registration_id: cleanId,
          event_name: data.eventName || "Smart India Hackathon 2026",
          issue_date: new Date().toISOString(),
          status: data.status || "VALID",
        },
        ...prev.filter((c) => c.certificate_id !== data.certificateId),
      ]);
    } catch (err: any) {
      setGenerateError(err.message || "Certificate Generation Error");
    } finally {
      setGeneratingId(null);
    }
  };

  // Certificate status lives in the roster sheet, not in this app. This asks the
  // server to re-read the sheet and reports whether the change has landed yet.
  const handleToggleRevoke = async (certId: string, currentStatus: string) => {
    const newStatus = currentStatus === "VALID" ? "REVOKED" : "VALID";
    try {
      const data = await fetchJson<any>("/api/admin/certificates/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ certificateId: certId, status: newStatus }),
      });

      setCertificates((prev) =>
        prev.map((c) => (c.certificate_id === certId ? { ...c, status: data.status } : c))
      );
      setSyncMessage(data.message);
    } catch (err: any) {
      if (err?.status === 401) {
        router.push("/admin/login");
        return;
      }
      setSyncMessage(err?.message || "Could not check that certificate.");
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
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (res.ok) {
        setImportResult(data);
        loadData();
      } else {
        alert(data.error || "CSV Import Failed");
      }
    } catch (err) {
      alert("CSV Import Error");
    } finally {
      setImporting(false);
    }
  };

  // Form Builder handlers
  const handleAddField = () => {
    if (!newFieldLabel.trim() || !formConfig) return;
    const fieldId = newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const optionsArr = newFieldType === "select" ? newFieldOptions.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    const newField: FormField = {
      id: fieldId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldReq,
      placeholder: newFieldPlaceholder.trim() || undefined,
      options: optionsArr,
    };

    setFormConfig({
      ...formConfig,
      fields: [...formConfig.fields, newField],
    });

    setNewFieldLabel("");
    setNewFieldPlaceholder("");
    setNewFieldOptions("");
  };

  const handleRemoveField = (fieldId: string) => {
    if (!formConfig) return;
    setFormConfig({
      ...formConfig,
      fields: formConfig.fields.filter((f) => f.id !== fieldId),
    });
  };

  const handleSaveFormConfig = async () => {
    if (!formConfig) return;
    setSavingForm(true);
    setFormSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConfig),
      });

      if (res.ok) {
        setFormSaveSuccess(true);
        setTimeout(() => setFormSaveSuccess(false), 3000);
      } else {
        alert("Failed to save form settings.");
      }
    } catch {
      alert("Save Form Error");
    } finally {
      setSavingForm(false);
    }
  };

  if (!authed) return null;

  const certificatesView: CertificateRecord[] = certificates;

  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.registration_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.team_name && p.team_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const submissionsView: FormSubmission[] = formSubmissions;

  const filteredSubmissions = submissionsView.filter((sub) => {
    const jsonStr = JSON.stringify(sub.data).toLowerCase();
    return jsonStr.includes(formSearch.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900/10 dark:border-slate-800 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            KLH ED Cell Administration
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white heading-font">
            Admin Portal
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live 3s Sync</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="text-xs text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
            Refresh Data
          </Button>

          <Badge variant="success" className="px-3 py-1 text-xs">
            Admin Authenticated
          </Badge>
          <Badge
            variant="success"
            className="px-3 py-1 text-xs"
            title="The roster Google Sheet is the source of truth. Refresh to pull the latest rows."
          >
            <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500 animate-pulse" />
            Google Sheet connected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="text-xs text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs text-red-600 dark:text-red-400 font-semibold flex items-center justify-between">
          <span>{loadError}</span>
          <Button size="sm" variant="outline" onClick={loadData} className="text-[11px] py-1 px-3">
            Retry
          </Button>
        </div>
      )}

      {/* ADMIN DIRECT CERTIFICATE GENERATOR WIDGET */}
      <Card className="border-blue-500/30 bg-white dark:bg-slate-900/90 shadow-xl">
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
              handleAdminGenerateCertificate(adminGenId, needsName ? adminGenName : undefined);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
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

            {needsName && (
              <Input
                placeholder="Participant Name (required for new roll number)..."
                value={adminGenName}
                onChange={(e) => setAdminGenName(e.target.value)}
                className="flex-1 border-amber-500/50"
                required
              />
            )}

            <Button
              type="submit"
              isLoading={generatingId === adminGenId && !!adminGenId}
              className="bg-slate-900 dark:bg-white text-white dark:text-black font-bold px-6 hover:bg-slate-800 dark:hover:bg-gray-200"
            >
              <FileCheck className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
              Generate Certificate
            </Button>
          </form>

          {generateError && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-400">{generateError}</p>
          )}

          {/* GENERATED CERTIFICATE PREVIEW MODAL / BANNER */}
          {generatedResult && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-300">
                <div>
                  <h4 className="font-bold text-white text-base">
                    Certificate Generated for {generatedResult.participantName}
                  </h4>
                  <p className="text-xs text-emerald-400">
                    Certificate ID:{" "}
                    <strong className="font-mono text-white">{generatedResult.certificateId}</strong>
                  </p>
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

              <div className="w-full h-80 border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
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
        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-900/10 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Participants</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
            {participants.length}
          </p>
          <span className="text-[10px] text-slate-500">Official Database Records</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-900/10 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Form Submissions</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {submissionsView.length}
          </p>
          <span className="text-[10px] text-slate-500">Hackathon Form Responses</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-900/10 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Generated</span>
            <FileCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
            {certificates.length}
          </p>
          <span className="text-[10px] text-slate-500">Certificates issued</span>
        </div>

        <div className="bg-white dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-900/10 dark:border-slate-800 space-y-1 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revoked</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-mono">
            {certificatesView.filter((c) => c.status === "REVOKED").length}
          </p>
          <span className="text-[10px] text-slate-500">Invalidated records</span>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center space-x-2 border-b border-slate-900/10 dark:border-slate-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "participants"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Participants ({participants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("form")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "form"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          <span>Form Builder & Responses ({submissionsView.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "certificates"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Issued Certificates ({certificatesView.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("import")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold tracking-wider uppercase transition-colors whitespace-nowrap ${
            activeTab === "import"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-t border-x border-slate-200 dark:border-slate-700"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>CSV Import</span>
        </button>
      </div>

      {/* TAB 1: PARTICIPANTS */}
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
                <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Registration ID</th>
                    <th className="px-4 py-3">Participant Name</th>
                    <th className="px-4 py-3">Team Name</th>
                    <th className="px-4 py-3">Eligibility</th>
                    <th className="px-4 py-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                  {filteredParticipants.slice(0, 100).map((p) => (
                    <tr key={p.registration_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {p.registration_id}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.team_name || "SIH 2026 Team"}</td>
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
                          <FileCheck className="w-3.5 h-3.5 mr-1 text-blue-500" />
                          Generate Certificate
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: FORM BUILDER & SUBMISSIONS */}
      {activeTab === "form" && (
        <div className="space-y-8">
          {/* FORM CONFIGURATION BUILDER */}
          <Card className="border-emerald-500/20 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <Edit className="w-5 h-5 text-emerald-500 mr-2" />
                  Custom Hackathon Form Builder
                </CardTitle>
                <CardDescription>
                  Full administrative control over fields, options, and titles for the public registration form.
                </CardDescription>
              </div>
              <Button
                onClick={handleSaveFormConfig}
                isLoading={savingForm}
                variant="success"
                className="font-bold text-xs"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {formSaveSuccess ? "Saved Successfully!" : "Save Form Settings"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {formConfig && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Form Title</label>
                      <Input
                        value={formConfig.title}
                        onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Form Subtitle / Instructions</label>
                      <Input
                        value={formConfig.description}
                        onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* GOOGLE SHEETS INTEGRATION HUB */}
                  <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                          <FileSpreadsheet className="w-4 h-4 mr-1.5 text-emerald-400" /> Connected Google Sheet
                        </h4>
                        <p className="text-xs text-slate-400">
                          This sheet is the participant database. Edit a row there and refresh to see it here.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          isLoading={syncingSheet}
                          onClick={handleSyncSheet}
                          className="text-xs font-bold text-emerald-400 border-emerald-500/40 hover:bg-emerald-950"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Re-read Roster Sheet
                        </Button>
                        <a
                          href={formConfig.googleSheetUrl || "https://docs.google.com/spreadsheets/d/1eZeQ_X89nSR_fma6eSbVaOuyXaZ8-ffO1KAaWoXFyCU/edit?usp=sharing"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm" variant="success" className="text-xs font-bold">
                            <Eye className="w-3.5 h-3.5 mr-1" /> Open Connected Google Sheet ↗
                          </Button>
                        </a>
                      </div>
                    </div>

                    {syncMessage && (
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold">
                        {syncMessage}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Google Sheet URL</label>
                        <Input
                          value={formConfig.googleSheetUrl || ""}
                          onChange={(e) => setFormConfig({ ...formConfig, googleSheetUrl: e.target.value })}
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          className="text-xs font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-300">Google Apps Script Webhook URL (For Direct Live Auto-Append)</label>
                        <Input
                          value={formConfig.googleSheetWebhookUrl || ""}
                          onChange={(e) => setFormConfig({ ...formConfig, googleSheetWebhookUrl: e.target.value })}
                          placeholder="https://script.google.com/macros/s/.../exec"
                          className="text-xs font-mono border-blue-500/40"
                        />
                      </div>
                    </div>

                    {/* 1-MINUTE APPS SCRIPT SETUP HELPER */}
                    <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="font-bold text-emerald-400 flex items-center">
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> 1-Minute Setup: Connect Live Auto-Append to Google Sheet
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const code = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Leader Name", "Leader Roll ID", "Email", "Phone", "Department", "Team Name", "No. of Members", "All Team Member Names & IDs", "Project Title"]);
  }
  sheet.appendRow([
    new Date(),
    data.name || "",
    data.registration_id || "",
    data.email || "",
    data.phone || "",
    data.department || "",
    data.team_name || "",
    data.team_member_count || 1,
    data.team_members || "",
    data.project_title || ""
  ]);
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`;
                            navigator.clipboard.writeText(code);
                            alert("Google Apps Script Code Copied to Clipboard!");
                          }}
                          className="text-[11px] font-bold text-blue-400 border-blue-500/30 hover:bg-blue-950"
                        >
                          Copy Apps Script Code
                        </Button>
                      </div>
                      <ol className="text-slate-300 text-[11px] space-y-1 list-decimal list-inside pl-1">
                        <li>Open your Google Sheet (<a href="https://docs.google.com/spreadsheets/d/1eZeQ_X89nSR_fma6eSbVaOuyXaZ8-ffO1KAaWoXFyCU/edit?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Sheet Link</a>) and click <strong>Extensions &gt; Apps Script</strong>.</li>
                        <li>Paste the copied code and click <strong>Deploy &gt; New Deployment</strong>.</li>
                        <li>Choose type: <strong>Web app</strong>, set <em>Who has access</em> to <strong>&quot;Anyone&quot;</strong>, and click <strong>Deploy</strong>.</li>
                        <li>Copy the generated Web App URL and paste it into the field above!</li>
                      </ol>
                    </div>
                  </div>

                  {/* ADMIN TEAM MEMBERS CONTROL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dynamic Team Member Inputs</label>
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="enableTeam"
                          checked={formConfig.enableTeamMembers !== false}
                          onChange={(e) => setFormConfig({ ...formConfig, enableTeamMembers: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <label htmlFor="enableTeam" className="text-xs font-semibold text-slate-900 dark:text-slate-200 cursor-pointer">
                          Enable Dynamic Team Member Fields on Registration Form
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Allowed Team Members Limit (Controlled by Admin)</label>
                      <select
                        value={formConfig.maxTeamMembers || 6}
                        onChange={(e) => setFormConfig({ ...formConfig, maxTeamMembers: parseInt(e.target.value, 10) })}
                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100"
                      >
                        {Array.from({ length: 10 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Max {i + 1} {i === 0 ? "Member (Solo Only)" : "Members per Team"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ACTIVE FIELDS LIST */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Form Fields ({formConfig.fields.length})</span>
                    <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {formConfig.fields.map((f, idx) => (
                        <div key={f.id} className="p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center space-x-3">
                            <span className="font-mono text-slate-400 font-bold">#{idx + 1}</span>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{f.label} {f.required && <span className="text-red-500">*</span>}</p>
                              <p className="text-[11px] text-slate-500 font-mono">Type: {f.type} | ID: {f.id}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleRemoveField(f.id)}
                            className="text-[10px] py-1 px-2"
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ADD NEW FIELD FORM */}
                  <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center">
                      <PlusCircle className="w-4 h-4 text-blue-500 mr-1.5" /> Add New Field to Registration Form
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <Input
                        placeholder="Field Label (e.g. GitHub Profile URL)"
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        className="text-xs sm:col-span-2"
                      />
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as any)}
                        className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                      >
                        <option value="text">Text Input</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="select">Dropdown Options</option>
                        <option value="textarea">Textarea (Long Text)</option>
                      </select>
                      <Button onClick={handleAddField} size="sm" className="bg-blue-600 text-white font-bold text-xs">
                        Add Field
                      </Button>
                    </div>

                    {newFieldType === "select" && (
                      <Input
                        placeholder="Dropdown Options (comma separated, e.g. Option 1, Option 2)"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        className="text-xs"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* FORM RESPONSES & EXCEL EXPORT */}
          <Card className="border-emerald-500/20 shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center text-lg">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 mr-2" />
                  Student Form Submissions ({submissionsView.length})
                </CardTitle>
                <CardDescription>
                  View live responses submitted by students and export to Excel/CSV.
                </CardDescription>
              </div>

              <div className="flex items-center space-x-3">
                <Input
                  placeholder="Filter responses..."
                  value={formSearch}
                  onChange={(e) => setFormSearch(e.target.value)}
                  className="w-48 text-xs"
                />
                <a href="/api/admin/form/export" download>
                  <Button variant="success" size="sm" className="font-bold text-xs">
                    <Download className="w-4 h-4 mr-1.5" />
                    Export Responses to Excel (.csv)
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Ref ID</th>
                      <th className="px-4 py-3">Timestamp</th>
                      {formConfig?.fields.map((f) => (
                        <th key={f.id} className="px-4 py-3">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                    {filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={(formConfig?.fields.length || 0) + 2} className="px-4 py-8 text-center text-slate-500">
                          No hackathon form submissions recorded yet. Submissions from /register will appear here in real time.
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{sub.id}</td>
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                            {new Date(sub.submitted_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                          </td>
                          {formConfig?.fields.map((f) => (
                            <td key={f.id} className="px-4 py-3 font-medium text-slate-900 dark:text-slate-200">
                              {sub.data[f.id] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: CERTIFICATES & REVOCATION */}
      {activeTab === "certificates" && (
        <Card>
          <CardHeader>
            <CardTitle>Issued Certificates & Revocation Controls</CardTitle>
            <CardDescription>View issued certificates or invalidate revoked records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-950 uppercase text-[10px] text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Certificate ID</th>
                    <th className="px-4 py-3">Participant Name</th>
                    <th className="px-4 py-3">Registration ID</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                  {certificatesView.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No eligible participants on the roster sheet yet. Add rows to the sheet, then refresh.
                      </td>
                    </tr>
                  ) : (
                    certificatesView.map((c) => (
                      <tr key={c.certificate_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {c.certificate_id}
                        </td>
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
                            className="text-blue-500 font-semibold hover:underline mr-2"
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

      {/* TAB 4: CSV IMPORT */}
      {activeTab === "import" && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Participant CSV Import</CardTitle>
            <CardDescription>Upload a CSV spreadsheet with participant registration records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <Upload className="w-10 h-10 text-blue-500 mx-auto" />
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-200 text-sm">Select or drag your CSV file</p>
                <p className="text-xs text-slate-500 font-mono">
                  Headers: registration_id, name, email, department, college, eligible
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={importing}
                className="cursor-pointer bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold"
              >
                Browse & Upload CSV
              </Button>
            </div>

            {importResult && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">CSV Import Summary</h4>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="info">Total: {importResult.totalRows}</Badge>
                  <Badge variant="success">Imported: {importResult.importedCount}</Badge>
                  {importResult.createdCount !== undefined && (
                    <Badge variant="neutral">New: {importResult.createdCount}</Badge>
                  )}
                  {importResult.updatedCount !== undefined && (
                    <Badge variant="neutral">Updated: {importResult.updatedCount}</Badge>
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
