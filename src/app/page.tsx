"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

export default function HomePage() {
  const [usernameInput, setUsernameInput] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    // Support typing either 'octocat' or 'github.com/octocat' or '@octocat'
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
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Draft & Prep Tool • You Own Every Claim</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Turn your GitHub into{" "}
          <span className="gradient-text">evidence-backed</span> resume bullets.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enter any GitHub username or swap <code className="text-blue-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">github.com</code> for our domain.
          We rank your strongest work, extract verified dependencies, and draft high-impact bullets citing exact files and commits.
        </p>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl glass-panel shadow-2xl border border-slate-700/80"
        >
          <div className="relative flex-1 w-full flex items-center">
            <Search className="w-5 h-5 text-slate-400 ml-3 absolute pointer-events-none" />
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Enter GitHub username (e.g. octocat)"
              className="w-full bg-transparent pl-11 pr-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-sans"
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-blue-600/30"
          >
            <span>Analyze Repos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Picks */}
        <div className="flex items-center justify-center gap-2 flex-wrap text-xs text-slate-400 pt-2">
          <span>Or test with:</span>
          {["octocat", "torvalds", "shadcn", "leerob"].map((handle) => (
            <button
              key={handle}
              onClick={() => handleQuickPick(handle)}
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors font-mono"
            >
              @{handle}
            </button>
          ))}
        </div>
      </section>

      {/* Non-Negotiable Product Rules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="glass-panel p-6 rounded-xl space-y-3 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Zero Hallucination</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The LLM may only state facts physically present in your repository. It will never invent fake metrics, user counts, or speedups.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-3 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Every Claim Cited</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Every single bullet point cites its evidence: README lines, <code className="font-mono text-blue-300">package.json</code> dependencies, or commit history. Uncited drafts are rejected.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-3 border border-slate-800/80 hover:border-slate-700/80 transition-colors">
          <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Ask, Don&apos;t Guess</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Missing measurable impact? We formulate concrete interview prompts for you to fill in your real metrics, keeping your resume 100% authentic.
          </p>
        </div>
      </section>

      {/* Pipeline Explanation */}
      <section className="glass-panel p-8 rounded-2xl border border-slate-800/80 space-y-6">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          <span>The Deterministic Phase 1 Architecture</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-blue-400 font-mono">1. GitHub API</div>
            <p className="text-slate-300">
              Batches public repositories, sampled file tree (depth 2), manifest files, and recent commit messages.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-purple-400 font-mono">2. Heuristic Scoring</div>
            <p className="text-slate-300">
              Ranks top 5 repos deterministically: penalizes forks, rewards recent activity, commit density, and meaningful size without LLM bias.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-emerald-400 font-mono">3. Context Budget</div>
            <p className="text-slate-300">
              Condenses repos into compact JSON (~2,500 tokens). Eliminates token bloat while keeping code proof.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="font-semibold text-pink-400 font-mono">4. Gemini + Zod Guard</div>
            <p className="text-slate-300">
              Low-temp Gemini Flash drafts bullets. Strict Zod schema parses output, triggering automated corrective retry if citations are missing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
