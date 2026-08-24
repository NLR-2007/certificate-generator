"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, ShieldCheck, FileCheck, Search, QrCode, Sparkles, CheckCircle2, ArrowRight, Building2, ChevronRight, Check } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [searchId, setSearchId] = useState("");
  const [searchType, setSearchType] = useState<"generate" | "verify">("generate");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    if (searchType === "generate") {
      router.push(`/generate?id=${encodeURIComponent(searchId.trim())}`);
    } else {
      router.push(`/verify/${encodeURIComponent(searchId.trim())}`);
    }
  };

  return (
    <div className="space-y-24 pb-20 bg-slate-50 dark:bg-black text-slate-900 dark:text-white">
      {/* HERO SECTION - MAGIC UI STARTUP TEMPLATE */}
      <section id="hero" className="relative mx-auto mt-20 max-w-[80rem] px-6 text-center md:px-8">
        {/* Glow Radial Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[22rem] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Shimmer Pill Badge */}
        <div className="inline-flex h-8 items-center justify-between rounded-full border border-slate-900/15 dark:border-white/20 bg-slate-900/5 dark:bg-white/10 px-4 text-xs font-medium text-slate-900 dark:text-white backdrop-blur-md transition-all hover:bg-slate-900/15 dark:hover:bg-white/20 cursor-pointer group gap-1.5">
          <span className="flex items-center font-normal">
            ✨ Official SIH 2026 Certificate Portal
            <ChevronRight className="ml-1 size-3.5 text-gray-600 dark:text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="bg-gradient-to-br from-slate-900 dark:from-white via-slate-900 dark:via-white to-slate-500 dark:to-white/40 bg-clip-text py-6 text-4xl font-medium leading-[1.1] tracking-tighter text-transparent sm:text-6xl md:text-7xl lg:text-8xl heading-font text-balance">
          Tamper-Proof Certificates <br className="hidden md:block"/>
          for Smart India Hackathon 2026
        </h1>

        {/* Hero Subtitle */}
        <p className="mb-10 text-lg tracking-tight text-gray-600 dark:text-gray-400 md:text-xl text-balance max-w-3xl mx-auto font-normal">
          Beautifully generated PDF certificates, official server-side identity verification, and instant cryptographic QR authentication built for KLH University.
        </p>

        {/* Hero CTA Button */}
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 h-11 px-6 transition-all group shadow-lg shadow-slate-900/10 dark:shadow-white/10"
          >
            <span>Generate Certificate Now</span>
            <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="/verify"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium border border-slate-900/15 dark:border-white/20 bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 text-slate-900 dark:text-white h-11 px-6 transition-all"
          >
            <span>Verify Certificate</span>
          </Link>
        </div>

        {/* HERO SHOWCASE FRAME (Magic UI Product Frame) */}
        <div className="relative mt-16 max-w-4xl mx-auto rounded-xl border border-slate-900/10 dark:border-white/15 bg-slate-900/5 dark:bg-white/5 p-6 md:p-8 backdrop-blur-xl shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-slate-900/10 dark:border-white/10 pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">KLH Certificate System • Instant Verification</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white heading-font">Registration ID Lookup</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">Enter your official student roll number to claim your PDF certificate.</p>
              </div>

              <div className="flex items-center space-x-1 bg-white/70 dark:bg-black/60 p-1 rounded-lg border border-slate-900/10 dark:border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setSearchType("generate")}
                  className={`px-3 py-1 font-medium rounded-md transition-all ${
                    searchType === "generate" ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setSearchType("verify")}
                  className={`px-3 py-1 font-medium rounded-md transition-all ${
                    searchType === "verify" ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Verify
                </button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder={searchType === "generate" ? "Enter Roll Number / Registration ID (e.g. 252003001)..." : "Enter Certificate ID (e.g. SIH26-8F3K92)..."}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-black/80 text-slate-900 dark:text-white placeholder:text-gray-500 rounded-lg text-sm border border-slate-900/15 dark:border-white/20 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 h-11 px-6 transition-all"
              >
                <span>Find Record</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>


          </div>
        </div>
      </section>

      {/* CLIENTS / INSTITUTIONAL ORGANIZERS SECTION */}
      <section id="clients" className="text-center mx-auto max-w-[80rem] px-6 md:px-8 border-y border-slate-900/10 dark:border-white/10 py-14">
        <h2 className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest">
          OFFICIAL INSTITUTIONAL ORGANIZERS & PARTNERS
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-gray-600 dark:text-gray-400 text-xs font-medium">
          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
            <Building2 className="w-4 h-4 text-slate-900 dark:text-white" />
            <span className="text-slate-900 dark:text-white">KLH UNIVERSITY BACHUPALLY</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
            <Award className="w-4 h-4 text-slate-900 dark:text-white" />
            <span className="text-slate-900 dark:text-white">MINISTRY OF EDUCATION</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
            <Sparkles className="w-4 h-4 text-slate-900 dark:text-white" />
            <span className="text-slate-900 dark:text-white">MHRD INNOVATION CELL</span>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
            <QrCode className="w-4 h-4 text-slate-900 dark:text-white" />
            <span className="text-slate-900 dark:text-white">SMART INDIA HACKATHON 2026</span>
          </div>
        </div>
      </section>

      {/* FEATURES & HIGHLIGHTS SECTION */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
        <div className="space-y-3">
          <h4 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white heading-font">Features</h4>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl heading-font">
            Built for Verification & Integrity
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
            Serverless PDF rendering with real-time database verification and dynamic font scaling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-green-400/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white heading-font">Verified Database Registry</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Names are fetched strictly from the official student database. Manual name alterations by users are disallowed.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-green-400/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white heading-font">Cryptographic QR Verification</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Every generated PDF embeds a dynamic QR code pointing to a live verification URL. Anyone scanning can confirm validity instantly.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-green-400/20 text-green-600 dark:text-green-400 flex items-center justify-center">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white heading-font">High-Res Vector PDF</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Overlay rendered server-side using `pdf-lib` without modifying the underlying official template artwork.
            </p>
          </div>
        </div>
      </section>

      {/* CTA SECTION - MAGIC UI STYLE */}
      <section id="cta" className="max-w-5xl mx-auto px-4 text-center">
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/5 dark:bg-white/5 p-12 text-center backdrop-blur-xl">
          <div className="mx-auto size-20 rounded-2xl border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-black/60 p-4 shadow-2xl flex items-center justify-center mb-4">
            <Award className="size-10 text-slate-900 dark:text-white" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl heading-font">
            Ready to generate your certificate?
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
            Enter your Roll Number to claim your official Smart India Hackathon 2026 certificate.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-white/90 h-11 px-8 transition-all mt-6 group"
          >
            <span>Get Started</span>
            <ChevronRight className="ml-1 size-4 transition-all duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
