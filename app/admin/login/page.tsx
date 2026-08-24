"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Key, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The passphrase is checked server-side against ADMIN_SECRET_KEY; the login
  // route sets an httpOnly session cookie, so no secret ever lives in this bundle.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase: key.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Invalid passphrase. Please check your admin password.");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Could not reach the authentication service. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white heading-font">
          Administrator Portal Login
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs">
          Authorized ED Cell admins only. Manage participants, templates & certificates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            Enter Admin Secret Key
          </CardTitle>
          <CardDescription>
            Use your master passphrase to authenticate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              error={error}
            />

            <Button type="submit" isLoading={loading} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-2.5">
              <span>Authenticate & Enter</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
