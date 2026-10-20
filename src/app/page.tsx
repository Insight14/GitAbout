"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  HelpCircle,
  Sparkles,
  GitFork,
  Cpu,
  Layers,
  Target,
  Mic,
  FileText,
  CheckCircle2,
  ChevronRight,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [usernameInput, setUsernameInput] = useState("");
  const [activeFeatureTab, setActiveFeatureTab] = useState<"evidence" | "tailor" | "interview" | "pdf">("evidence");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    let cleaned = usernameInput.trim().replace(/^@/, "");
    if (cleaned.includes("github.com/")) {
      const parts = cleaned.split("github.com/");
      cleaned = parts[1].split("/")[0].trim();
    }
    cleaned = cleaned.replace(/\/.*$/, "");

    if (cleaned) {
      router.push(`/${encodeURIComponent(cleaned)}`);
    }
  };

  const handleQuickPick = (handle: string) => {
    setUsernameInput(handle);
    router.push(`/${encodeURIComponent(handle)}`);
  };

  return (
    <div className="space-y-20 py-4 sm:py-10">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-8 relative">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Logo Presentation */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition duration-700 animate-pulse" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-slate-950 border-2 border-purple-500/50 shadow-2xl flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.png"
                alt="GitAnswer Logo"
                width={128}
                height={128}
                priority
                className="object-contain transform group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-700/50 text-purple-200 text-xs font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>GitAnswer • Zero Hallucination Resume & Interview Studio</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            Turn your GitHub into{" "}
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
              evidence-backed
            </span>{" "}
            resume drafts.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enter any GitHub username. We rank your strongest work deterministically, verify manifest dependencies, and generate ATS bullets with exact codebase citations.
          </p>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-2xl glass-panel shadow-2xl border border-purple-800/40 focus-within:border-purple-500/80 transition-all bg-slate-900/80 backdrop-blur-2xl"
        >
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-purple-400 ml-3.5 absolute pointer-events-none" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter GitHub handle (e.g. octocat, torvalds, shadcn)"
              className="w-full bg-transparent pl-12 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-sans"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:from-purple-700 active:to-indigo-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 cursor-pointer"
          >
            <span>Analyze Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Picks */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 pt-1">
          <span className="text-slate-500 font-medium">Quick examples:</span>
          {[
            { label: "octocat", tag: "Official Flagship" },
            { label: "shadcn", tag: "UI Components" },
            { label: "torvalds", tag: "Kernel & C" },
            { label: "leerob", tag: "Next.js & React" },
          ].map(({ label, tag }) => (
            <button
              key={label}
              onClick={() => handleQuickPick(label)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-purple-950 text-slate-300 hover:text-purple-200 border border-slate-800 hover:border-purple-700/60 transition-all font-mono flex items-center gap-1.5"
            >
              <span>@{label}</span>
              <span className="text-[10px] text-slate-500 hidden md:inline">({tag})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive Feature Showcase with Navigable Tabs */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Designed for Authenticity & Preparation
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Explore the four pillars that differentiate GitAnswer from generic prompt wrappers.
          </p>
        </div>

        {/* Navigable Feature Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 max-w-2xl mx-auto overflow-x-auto">
          {[
            { id: "evidence", label: "Evidence Engine", icon: ShieldCheck },
            { id: "tailor", label: "Job Tailoring", icon: Target },
            { id: "interview", label: "Mock Interviews", icon: Mic },
            { id: "pdf", label: "ATS Export", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFeatureTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(tab.id as typeof activeFeatureTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Feature Panel Preview */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-purple-900/30 shadow-2xl relative overflow-hidden bg-slate-900/50">
          {activeFeatureTab === "evidence" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Strict Codebase Evidence Citations</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Every bullet point cites its evidence: exact README lines, verified dependencies from <code className="font-mono text-purple-300 text-xs">package.json</code> or <code className="font-mono text-purple-300 text-xs">go.mod</code>, and physical commit history.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Zero hallucinations: cannot invent fake metrics or imaginary speedups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Clickable source badges link directly to proof lines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>&ldquo;Ask, Don&apos;t Guess&rdquo; prompts for user-verified business impact</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="text-[11px] text-purple-400 font-bold border-b border-slate-800 pb-2 flex items-center justify-between">
                  <span>RESUME BULLET EXAMPLE</span>
                  <span className="text-emerald-400 font-mono text-[10px]">CITED: README.md:L12</span>
                </div>
                <p className="text-slate-200 font-sans leading-relaxed text-sm">
                  &bull; Engineered high-throughput cache layer utilizing Redis with LRU eviction policy, supporting sub-millisecond retrieval across concurrent worker processes.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[10px]">
                    Evidence: package.json (ioredis@5.3)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/40 text-blue-300 text-[10px]">
                    Commit: 8d29a1 (&quot;add cluster caching&quot;)
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === "tailor" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-700/60 flex items-center justify-center text-indigo-300">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Target Job & ATS Qualification Match</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Paste any job description to instantly re-rank candidate repositories by relevance. Detect direct skill matches, adjacent potential, and honest qualification gaps.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dynamic ATS matching percentage based on verified code</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Identifies what&apos;s missing and provides honest interview bridges</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Prioritizes the exact repos technical interviewers will inspect</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-indigo-400 font-bold">MATCH BREAKDOWN</span>
                  <span className="text-emerald-400 font-bold">85% ROLE ALIGNMENT</span>
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded bg-emerald-950/40 border border-emerald-900/50 text-emerald-300">
                    <strong>Direct Matches:</strong> TypeScript, Next.js App Router, Tailwind CSS, REST APIs
                  </div>
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-900/50 text-amber-300">
                    <strong>Adjacent Skills:</strong> Redis caching maps directly to Memcached requirements
                  </div>
                  <div className="p-2 rounded bg-purple-950/40 border border-purple-900/50 text-purple-300">
                    <strong>Honest Gap:</strong> No Kubernetes manifests detected; prepare interview answer on container orchestration experience
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === "interview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-pink-950/70 border border-pink-700/60 flex items-center justify-center text-pink-300">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">Timed Mock Technical Interviews</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Interviews grill you on architecture, tradeoffs, failure modes, and weak spots. Practice answering hard questions under a realistic 2-minute countdown timer with persistent rehearsal notes.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Categorized into Architecture, Tradeoffs, Failure Recovery, and Weak Spots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Real-time streaming Q&A generation grounded in repo files</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Rehearsal notes persist locally in your browser</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-pink-400 font-bold">INTERVIEW QUESTION</span>
                  <span className="text-amber-400 font-bold">⏱️ 02:00 COUNTDOWN</span>
                </div>
                <p className="text-slate-100 font-sans text-sm font-semibold">
                  &ldquo;In this repository, why did you choose Upstash Redis over an in-memory Map, and how does your fallback handle network timeouts?&rdquo;
                </p>
                <div className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded border border-slate-800">
                  <strong>Expected Proof:</strong> Mentions <code className="text-purple-300">src/lib/cache/redis.ts</code> graceful degradation to in-memory fallback on connection refusal.
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === "pdf" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-700/60 flex items-center justify-center text-purple-300">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">ATS-Compliant PDF & Markdown Export</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Export ready-to-submit ATS-friendly resumes instantly in single-click PDF or formatted Markdown, complete with candidate header and verifiable portfolio links.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Server-side PDF generation via @react-pdf/renderer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>In-place bullet & summary editing before export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Embeds the official GitAnswer QA badge directly on the document</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-purple-400 font-bold">EXPORT OPTIONS</span>
                  <span className="text-slate-400">100% CLIENT OVERRIDES</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-800/40 text-purple-200">
                    <FileText className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <div className="font-bold text-xs">PDF Document</div>
                    <div className="text-[10px] text-slate-400">ATS standard format</div>
                  </div>
                  <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-indigo-200">
                    <Zap className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
                    <div className="font-bold text-xs">Markdown Draft</div>
                    <div className="text-[10px] text-slate-400">Ready for Notion/Obsidian</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Non-Negotiable Rules Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-2">
        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-purple-500/40 transition-all bg-slate-900/60">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Hallucination</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The LLM may only state facts physically present in your repository. It will never invent fake metrics, user counts, or speedups.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-purple-500/40 transition-all bg-slate-900/60">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/60 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Every Claim Cited</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every single bullet point cites its evidence: README lines, <code className="font-mono text-purple-300">package.json</code> dependencies, or commit history.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3 border border-slate-800/80 hover:border-purple-500/40 transition-all bg-slate-900/60">
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Ask, Don&apos;t Guess</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Missing measurable impact? We formulate concrete interview prompts for you to fill in your real metrics, keeping your resume 100% authentic.
          </p>
        </div>
      </section>
    </div>
  );
}
