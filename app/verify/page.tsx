"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Search, QrCode } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function VerifyLookupPage() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) return;
    router.push(`/verify/${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white heading-font">
          Public Certificate Verification Portal
        </h1>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Verify the authenticity and validity of Smart India Hackathon 2026 certificates issued by KLH University.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <QrCode className="w-4 h-4 text-emerald-400 mr-2" />
            Enter Certificate ID
          </CardTitle>
          <CardDescription>
            Input the unique Certificate ID printed on the PDF or scan the embedded QR code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              placeholder="e.g. SIH26-8F3K92..."
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="text-center font-mono font-bold text-lg tracking-wider py-3"
            />
            <Button type="submit" variant="success" className="w-full font-bold py-3">
              <Search className="w-4 h-4 mr-2" />
              Verify Certificate Authenticity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
