import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { GitBranch, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "GitAnswer • GitHub to Evidence-Backed Resume Drafts",
  description:
    "Transform public GitHub repositories into bullet drafts and interview talking points grounded strictly in codebase evidence. Zero hallucinations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        {/* Navigation */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                <GitBranch className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Git<span className="gradient-text">Answer</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-1">
                  Evidence-Grounded Resume Drafts
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4 text-xs">
              <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Hallucination Guaranteed</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              GitAnswer: A draft & interview prep tool. Every claim is cited directly from repo evidence.
            </p>
            <p className="font-mono text-[11px] text-slate-600">
              Phase 1 • Gemini Flash + Octokit
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
