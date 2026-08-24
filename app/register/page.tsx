"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, Rocket, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { FormConfig, FormField } from "@/lib/db/mock-store";

export default function HackathonRegisterPage() {
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [submittedPass, setSubmittedPass] = useState<any | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/register")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setFormConfig(data.config);
          // Initialize form fields state
          const initial: Record<string, string> = {};
          data.config.fields.forEach((f: FormField) => {
            initial[f.id] = f.type === "select" && f.options?.[0] ? f.options[0] : "";
          });
          setFormData(initial);
        }
      })
      .catch(() => setError("Failed to load registration form."))
      .finally(() => setFetching(false));
  }, []);

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Submission failed.");
      }

      setSubmittedPass({
        submissionId: result.submissionId,
        formData,
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Loading Hackathon Registration Form...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* HEADER HERO */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          <span>KLH Hackathon Registration</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl heading-font tracking-tight">
          {formConfig?.title || "Hackathon Registration Form"}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
          {formConfig?.description || "Fill out your details to enter upcoming Hackathons & Sprints at KLH Bachupally."}
        </p>
      </div>

      {/* REGISTRATION FORM OR SUCCESS PASS */}
      {submittedPass ? (
        /* SUCCESS CONFIRMATION PASS */
        <Card className="border-emerald-500/30 bg-slate-900 text-white shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto" />
            <h2 className="text-2xl font-extrabold text-white heading-font">Hackathon Registration Confirmed!</h2>
            <p className="text-emerald-100 text-xs font-mono">Submission Ref: {submittedPass.submissionId}</p>
          </div>

          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {formConfig?.fields.map((f) => (
                <div key={f.id} className="space-y-1 border-b border-slate-800 pb-3">
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">{f.label}</span>
                  <p className="font-bold text-white text-sm">{submittedPass.formData[f.id] || "N/A"}</p>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link href="/generate" className="w-full sm:w-auto">
                <Button variant="primary" className="w-full bg-white text-slate-950 font-bold hover:bg-gray-200">
                  <span>Generate Certificate Portal</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setSubmittedPass(null)}
                className="w-full sm:w-auto text-xs text-slate-400 border-slate-700 hover:bg-slate-800"
              >
                Submit Another Response
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* DYNAMIC HACKATHON REGISTRATION FORM */
        <Card className="border-slate-900/10 dark:border-white/10 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
              Registration Details
            </CardTitle>
            <CardDescription>
              Please enter accurate information. Response details will be saved directly for administrative review.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formConfig?.fields.map((f) => {
                  const isFullWidth = f.type === "textarea" || f.id === "project_title" || f.id === "team_name";
                  return (
                    <div
                      key={f.id}
                      className={`space-y-1.5 ${isFullWidth ? "md:col-span-2" : ""}`}
                    >
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {f.label} {f.required && <span className="text-red-500">*</span>}
                      </label>

                      {f.type === "select" ? (
                        <select
                          value={formData[f.id] || ""}
                          onChange={(e) => handleChange(f.id, e.target.value)}
                          required={f.required}
                          className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                        >
                          {f.options?.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : f.type === "textarea" ? (
                        <textarea
                          placeholder={f.placeholder || ""}
                          value={formData[f.id] || ""}
                          onChange={(e) => handleChange(f.id, e.target.value)}
                          required={f.required}
                          rows={3}
                          className="flex w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-black px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-300"
                        />
                      ) : (
                        <Input
                          type={f.type}
                          placeholder={f.placeholder || ""}
                          value={formData[f.id] || ""}
                          onChange={(e) => handleChange(f.id, e.target.value)}
                          required={f.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                isLoading={loading}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-gray-200 font-bold py-3 text-base"
              >
                <span>Submit Registration</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
