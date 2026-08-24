import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { themeInitScript } from "@/components/theme/theme-script";

export const metadata: Metadata = {
  title: "KLH Certificate System | SIH 2026",
  description: "Generate and verify official Smart India Hackathon 2026 certificates from Koneru Lakshmaiah Education Foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme class is written by themeInitScript before paint, so the server
    // markup deliberately differs from the client's - hence suppressHydrationWarning.
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-slate-50 dark:bg-black text-slate-900 dark:text-white antialiased min-h-screen flex flex-col selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
