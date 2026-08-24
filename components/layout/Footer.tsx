
import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900/10 dark:border-white/10 bg-slate-50 dark:bg-black text-gray-600 dark:text-gray-400 text-sm">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="md:flex md:justify-between px-8 p-4 py-16 sm:pb-16 gap-8">
          {/* Brand Info */}
          <div className="mb-12 flex-col flex gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-slate-900 dark:text-white heading-font">
                KLH Certificate
              </span>
            </Link>
            <p className="max-w-xs text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              Official Certificate Generator & Verification Portal for Koneru Lakshmaiah Education Foundation (KLH Bachupally) - Smart India Hackathon 2026.
            </p>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:gap-12 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-semibold text-slate-900 dark:text-white uppercase">
                Product
              </h2>
              <ul className="gap-3 grid text-xs">
                <li>
                  <Link href="/generate" className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Generate Certificate
                  </Link>
                </li>
                <li>
                  <Link href="/verify" className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Verify Certificate
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-semibold text-slate-900 dark:text-white uppercase">
                Event
              </h2>
              <ul className="gap-3 grid text-xs">
                <li className="text-gray-600 dark:text-gray-400">Internal SIH 2026</li>
                <li className="text-gray-600 dark:text-gray-400">KLH Bachupally</li>
                <li className="text-gray-600 dark:text-gray-400">ED Cell & IIC</li>
              </ul>
            </div>

            <div>
              <h2 className="mb-6 text-sm tracking-tighter font-semibold text-slate-900 dark:text-white uppercase">
                Security
              </h2>
              <ul className="gap-3 grid text-xs">
                <li className="text-gray-600 dark:text-gray-400">Cryptographic QR</li>
                <li className="text-gray-600 dark:text-gray-400">Vercel Serverless</li>
                <li className="text-gray-600 dark:text-gray-400">Verified Database</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-900/10 dark:border-white/10 py-6 px-8 gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} KLH University ED Cell. All rights reserved.</p>
          <p>Developed by <span className="font-semibold text-slate-900 dark:text-white">Black Panthers</span></p>
        </div>
      </div>
    </footer>
  );
};
