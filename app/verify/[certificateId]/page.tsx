"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, ArrowLeft, Calendar, User, Award, Hash, Building } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = (params.certificateId as string) || "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    found: boolean;
    certificate?: {
      certificate_id: string;
      participant_name: string;
      registration_id: string;
      event_name: string;
      issue_date: string;
      status: "VALID" | "REVOKED";
      college?: string;
      department?: string;
    };
  } | null>(null);

  useEffect(() => {
    if (!certificateId) return;

    fetch(`/api/verify?certificateId=${encodeURIComponent(certificateId)}`)
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
      })
      .catch(() => {
        setData({ found: false });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [certificateId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-400">Verifying certificate authenticity...</p>
      </div>
    );
  }

  if (!data || !data.found || !data.certificate) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20 shadow-lg">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <Badge variant="danger" className="px-3 py-1 text-xs">
            Verification Failed
          </Badge>
          <h1 className="text-3xl font-extrabold text-white heading-font">
            Certificate Not Found
          </h1>
          <p className="text-slate-400 text-sm">
            No active certificate record was found matching ID: <strong className="font-mono text-slate-200">{certificateId}</strong>.
          </p>
        </div>

        <Link href="/verify">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Another Certificate ID
          </Button>
        </Link>
      </div>
    );
  }

  const cert = data.certificate;
  const isValid = cert.status === "VALID";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      {/* STATUS BADGE BANNER */}
      <div className={`p-6 rounded-2xl border text-center space-y-3 backdrop-blur-xl ${
        isValid ? "bg-emerald-950/40 border-emerald-500/30" : "bg-red-950/40 border-red-500/30"
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl ${
          isValid ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {isValid ? <CheckCircle2 className="w-9 h-9" /> : <XCircle className="w-9 h-9" />}
        </div>

        <div className="space-y-1">
          <h1 className={`text-2xl font-extrabold heading-font ${
            isValid ? "text-emerald-300" : "text-red-300"
          }`}>
            {isValid ? "Certificate Verified ✓" : "Certificate Revoked ✕"}
          </h1>
          <p className={`text-xs font-semibold uppercase tracking-wider ${
            isValid ? "text-emerald-400" : "text-red-400"
          }`}>
            Official Record Status: {cert.status}
          </p>
        </div>
      </div>

      {/* CERTIFICATE DETAILS CARD */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
        <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Certificate Attributes
          </span>
          <span className="font-mono text-xs font-bold bg-slate-950 text-blue-400 px-3 py-1 rounded-md border border-slate-800">
            ID: {cert.certificate_id}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center">
              <User className="w-3.5 h-3.5 mr-1 text-slate-500" /> Participant Name
            </span>
            <p className="text-lg font-bold text-white heading-font">{cert.participant_name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center">
              <Hash className="w-3.5 h-3.5 mr-1 text-slate-500" /> Registration ID
            </span>
            <p className="text-base font-mono font-bold text-slate-200">{cert.registration_id}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center">
              <Award className="w-3.5 h-3.5 mr-1 text-slate-500" /> Event Name
            </span>
            <p className="text-sm font-semibold text-slate-200">{cert.event_name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" /> Date Issued
            </span>
            <p className="text-sm font-semibold text-slate-200">
              {new Date(cert.issue_date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <span className="flex items-center">
            <Building className="w-3.5 h-3.5 mr-1 text-slate-500" /> KLH University ED Cell & IIC
          </span>
          <span className="text-emerald-400 font-semibold">Cryptographically Verified</span>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link href="/verify">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Verify Another Certificate
          </Button>
        </Link>
      </div>
    </div>
  );
}
