import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, ExternalLink } from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";

export const metadata: Metadata = {
  title: "GitAnswer • GitHub to Evidence-Backed Resume Drafts & Interview Prep",
  description:
    "Transform public GitHub repositories into bullet drafts and interview talking points grounded strictly in codebase evidence. Zero hallucinations.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-purple-600 selection:text-white">
        {/* Navigation */}
        <header className="border-b border-purple-900/30 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-purple-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 via-indigo-500 to-purple-400 shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform">
                <Image
                  src="/logo.png"
                  alt="GitAnswer Logo"
                  width={40}
                  height={40}
                  priority
                  className="rounded-full object-cover bg-slate-950"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  Git<span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">Answer</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800/60 ml-1">
                    v2.0
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-1 hidden sm:inline">
                  Codebase Evidence • Zero Hallucination
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4 text-xs">
              <div className="hidden sm:flex items-center gap-1.5 text-emerald-400 font-mono bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-800/50 shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Hallucination Guaranteed</span>
              </div>

              <a
                href="https://github.com/Insight14/GitAbout"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-purple-500/40 transition-all font-mono text-xs shadow-sm"
              >
                <GithubIcon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-900/80 bg-slate-950/60 py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="GitAnswer Logo"
                width={28}
                height={28}
                className="rounded-full opacity-80"
              />
              <p className="text-slate-400">
                <strong className="text-slate-300 font-medium">GitAnswer</strong>: Real GitHub evidence drafts & technical interview prep. Zero hallucinations.
              </p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
              <a
                href="https://github.com/Insight14/GitAbout"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-purple-400 transition-colors"
              >
                Insight14/GitAbout
              </a>
              <span>•</span>
              <span>Next.js 15 & Gemini Flash</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
