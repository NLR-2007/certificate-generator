"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, ShieldCheck, FileCheck, Lock, Menu, X, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register for Hackathon" },
    { href: "/generate", label: "Generate Certificate" },
    { href: "/verify", label: "Verify Certificate" },
    { href: "/admin", label: "Admin Portal" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-bold shadow-md">
            <Award className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight heading-font">
            KLH <span className="text-gray-600 dark:text-gray-400 font-normal">Certificate</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive ? "text-slate-900 dark:text-white font-semibold" : "text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle />
          <Link
            href="/generate"
            className="inline-flex items-center justify-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-black font-medium hover:bg-slate-800 dark:hover:bg-gray-200 h-9 px-4 text-sm transition-colors"
          >
            <span>Get Certificate</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-black px-4 pt-3 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white py-1.5"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/generate"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center rounded-md bg-slate-900 dark:bg-white text-white dark:text-black font-medium py-2 text-sm"
            >
              Get Certificate
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
