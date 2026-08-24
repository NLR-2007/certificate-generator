"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileCheck, CheckCircle2, AlertCircle, Download, Eye, ShieldCheck, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function GenerateContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [regId, setRegId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [participant, setParticipant] = useState<{
    registration_id: string;
    name: string;
    department?: string;
    college?: string;
    event_name: string;
    eligible: boolean;
    certificate_generated: boolean;
    certificate_id?: string;
  } | null>(null);

  const [generatedCert, setGeneratedCert] = useState<{
    certificate_id: string;
    pdf_url?: string;
    pdf_base64?: string;
    verification_url: string;
  } | null>(null);

  useEffect(() => {
    if (initialId) {
      handleLookup(initialId);
    }
  }, [initialId]);

  const handleLookup = async (idToSearch: string) => {
    const cleanId = idToSearch.trim();
    if (!cleanId) return;

    setLoading(true);
    setError(null);
    setParticipant(null);
    setGeneratedCert(null);

    try {
      const res = await fetch(`/api/participant/verify?registrationId=${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "We couldn't find an eligible participant with this registration ID.");
      }

      setParticipant(data.participant);
      if (data.existingCertificate) {
        setGeneratedCert({
          certificate_id: data.existingCertificate.certificate_id,
          pdf_url: data.existingCertificate.pdf_url,
          verification_url: data.existingCertificate.verification_url,
        });
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Also used to re-fetch the PDF for an already-issued certificate: the API is
  // idempotent and returns the existing record plus freshly rendered PDF bytes.
  const handleGenerateCertificate = async () => {
    if (!participant) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/certificate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: participant.registration_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not generate certificate right now.");
      }

      setGeneratedCert({
        certificate_id: data.certificateId,
        pdf_url: data.pdfUrl,
        pdf_base64: data.pdfBase64,
        verification_url: data.verificationUrl,
      });

      setParticipant((prev) => prev ? { ...prev, certificate_generated: true, certificate_id: data.certificateId } : null);
    } catch (err: any) {
      setError(err.message || "Failed to generate certificate. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* HEADER BANNER */}
      <div className="text-center space-y-3">
        <Badge variant="info" className="px-3 py-1 text-xs">
          Smart India Hackathon 2026
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white heading-font tracking-tight">
          Generate Your Certificate
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg mx-auto">
          Enter your official Roll Number or Registration ID to verify your record and generate your official PDF certificate.
        </p>
      </div>

      {/* SEARCH CARD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            Participant Verification Lookup
          </CardTitle>
          <CardDescription>
            Your official name is pulled directly from the verified database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(regId);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="flex-1">
              <Input
                placeholder="Enter Registration ID (e.g., 252003001)..."
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" isLoading={loading} className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
              <Search className="w-4 h-4 mr-2" />
              Find Record
            </Button>
          </form>


        </CardContent>
      </Card>

      {/* ERROR MSG */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl p-4 flex items-start space-x-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Verification Error</p>
            <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* PARTICIPANT DETAILS CARD */}
      {participant && (
        <Card className="border-blue-500/30 bg-white/80 dark:bg-slate-900/80 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Official Record Verified</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white heading-font">{participant.name}</h3>
              </div>
            </div>

            <Badge variant={participant.eligible ? "success" : "danger"} className="text-xs py-1 px-3">
              {participant.eligible ? "Eligible for Certificate" : "Not Eligible"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium uppercase tracking-wider block text-[10px]">Registration ID</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold text-sm">{participant.registration_id}</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium uppercase tracking-wider block text-[10px]">Event</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{participant.event_name}</span>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 font-medium uppercase tracking-wider block text-[10px]">Department / College</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">{participant.department || "CSE"} ({participant.college || "KLH University"})</span>
            </div>
          </div>

          {/* GENERATION AREA */}
          <div className="pt-2">
            {!generatedCert ? (
              <div className="bg-slate-100 dark:bg-slate-950 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="font-bold text-slate-900 dark:text-white text-sm">Ready to Generate Official PDF</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Your certificate will embed a cryptographic QR code and issue date.</p>
                </div>
                <Button
                  onClick={handleGenerateCertificate}
                  isLoading={generating}
                  disabled={!participant.eligible}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold w-full sm:w-auto px-6"
                >
                  <FileCheck className="w-4 h-4 mr-2 text-blue-300 dark:text-blue-600" />
                  Generate Certificate Now
                </Button>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-6 space-y-6">
                <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      {generatedCert.pdf_base64
                        ? "Certificate Generated Successfully!"
                        : "Certificate Already Issued"}
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Certificate ID: <strong className="font-mono">{generatedCert.certificate_id}</strong></p>
                  </div>
                </div>

                {/* PDF PREVIEW / DOWNLOAD ACTIONS */}
                <div className="flex flex-wrap gap-3">
                  {!generatedCert.pdf_base64 && (
                    <Button
                      onClick={handleGenerateCertificate}
                      isLoading={generating}
                      variant="success"
                      className="font-bold"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Load & Download PDF Certificate
                    </Button>
                  )}

                  {generatedCert.pdf_base64 && (
                    <a
                      href={`data:application/pdf;base64,${generatedCert.pdf_base64}`}
                      download={`${participant.name.replace(/\s+/g, "_")}_SIH2026_Certificate.pdf`}
                    >
                      <Button variant="success" className="font-bold">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Certificate
                      </Button>
                    </a>
                  )}

                  <a
                    href={generatedCert.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950">
                      <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                      View Public Verification Page
                    </Button>
                  </a>
                </div>

                {/* IN-BROWSER PDF PREVIEW EMBED */}
                {generatedCert.pdf_base64 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
                      <Eye className="w-4 h-4 mr-1 text-slate-600 dark:text-slate-400" /> Live Certificate PDF Preview
                    </p>
                    <div className="w-full h-[500px] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-950">
                      <iframe
                        src={`data:application/pdf;base64,${generatedCert.pdf_base64}#toolbar=0&navpanes=0`}
                        className="w-full h-full"
                        title="Certificate PDF Preview"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-600 dark:text-slate-400">Loading certificate generator...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
