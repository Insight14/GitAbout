"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AnalysisResponse,
  ProjectDraft,
  TailoredProjectDraft,
} from "@/lib/types";
import { RepoCard } from "@/components/RepoCard";
import { MarkdownExport } from "@/components/MarkdownExport";
import { JobTailoringPanel } from "@/components/JobTailoringPanel";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FolderGit2,
  Sparkles,
  RefreshCw,
  KeyRound,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/GithubIcon";

export default function UserResultsPage() {
  const params = useParams();
  const router = useRouter();
  const rawUsername = params?.username as string;
  const username = rawUsername ? decodeURIComponent(rawUsername) : "";

  const [loading, setLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Connecting to GitHub API...");
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [tailoredProjects, setTailoredProjects] = useState<TailoredProjectDraft[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGeminiKeyMissing, setIsGeminiKeyMissing] = useState(false);

  const runAnalysis = async () => {
    if (!username) return;

    setLoading(true);
    setError(null);
    setIsGeminiKeyMissing(false);
    setLoadingStep("Fetching public repositories and commit logs...");

    try {
      const stepTimer1 = setTimeout(() => {
        setLoadingStep("Heuristically ranking top candidate repositories...");
      }, 1500);

      const stepTimer2 = setTimeout(() => {
        setLoadingStep("Extracting dependencies and building context...");
      }, 3500);

      const stepTimer3 = setTimeout(() => {
        setLoadingStep("Synthesizing evidence-backed bullets...");
      }, 6000);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);

      const json = await res.json();

      if (!res.ok) {
        if (json.error && json.error.includes("GEMINI_API_KEY")) {
          setIsGeminiKeyMissing(true);
        }
        throw new Error(json.error || `Analysis failed with status ${res.status}`);
      }

      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [username]);

  return (
    <div className="space-y-8">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Search</span>
        </Link>

        {data && data.projects.length > 0 && (
          <MarkdownExport username={data.username} projects={data.projects} />
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
            <Sparkles className="w-6 h-6 text-blue-400 absolute" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Analyzing @{username}</h2>
            <p className="text-sm text-slate-400 font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>{loadingStep}</span>
            </p>
          </div>

          {/* Skeleton Cards Preview */}
          <div className="max-w-4xl mx-auto space-y-4 pt-4 opacity-30 pointer-events-none">
            <div className="h-44 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
            <div className="h-44 rounded-xl bg-slate-900 border border-slate-800 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto p-6 rounded-xl glass-panel border border-red-900/50 bg-red-950/20 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto">
            {isGeminiKeyMissing ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {isGeminiKeyMissing ? "Gemini API Key Required" : "Analysis Failed"}
            </h3>
            <p className="text-sm text-red-200/80 leading-relaxed font-sans">
              {error}
            </p>
          </div>

          {isGeminiKeyMissing && (
            <div className="text-left bg-slate-950/80 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <p className="text-slate-400">To enable LLM drafting, add your Gemini API key in <span className="text-white">.env.local</span>:</p>
              <p className="text-blue-300">GEMINI_API_KEY=your_gemini_api_key_here</p>
              <p className="text-slate-400">Then reload this page.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => runAnalysis()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
            >
              Try Another Username
            </Link>
          </div>
        </div>
      )}

      {/* Content State */}
      {!loading && !error && data && (
        <div className="space-y-8">
          {/* Profile Header Card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              {data.profile.avatarUrl ? (
                <img
                  src={data.profile.avatarUrl}
                  alt={data.username}
                  className="w-20 h-20 rounded-2xl border-2 border-slate-700 shadow-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                  <GithubIcon className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    {data.profile.name || data.username}
                  </h1>
                  <span className="text-sm text-slate-400 font-mono">
                    @{data.username}
                  </span>
                </div>

                {data.profile.bio && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    {data.profile.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 justify-center sm:justify-start pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                    <strong className="text-white">{data.profile.publicRepos}</strong> public repos
                  </span>
                  <span>•</span>
                  <span>
                    Top <strong className="text-white">{data.projects.length}</strong> ranked projects analyzed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <a
                href={data.profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
                <span>View GitHub</span>
              </a>
            </div>
          </div>

          {/* Zero Public Repos Notice */}
          {data.projects.length === 0 && (
            <div className="glass-panel p-10 rounded-xl text-center space-y-3">
              <FolderGit2 className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-semibold text-white">No Public Repositories Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                @{data.username} does not have any public repositories available to analyze.
              </p>
            </div>
          )}

          {/* Ranked Projects List */}
          {data.projects.length > 0 && (
            <div className="space-y-6">
              {/* Phase 3: Job Description Tailoring Panel */}
              <JobTailoringPanel
                username={data.username}
                originalProjects={data.projects}
                onTailoredChange={setTailoredProjects}
              />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>
                      {tailoredProjects ? "Role-Tailored Project Order" : "Strongest Public Projects"}
                    </span>
                    {tailoredProjects && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                        Tailored View
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {tailoredProjects
                      ? "Re-ordered based on role relevance with direct qualification matches highlighted."
                      : "Ranked by originality, commit activity, documentation, and scope."}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {tailoredProjects
                  ? tailoredProjects.map((item) => (
                      <RepoCard
                        key={item.repo}
                        project={item.originalDraft}
                        username={data.username}
                        relevanceScore={item.relevanceScore}
                        relevanceReason={item.relevanceReason}
                        isTailored={true}
                      />
                    ))
                  : data.projects.map((proj) => (
                      <RepoCard key={proj.repo} project={proj} username={data.username} />
                    ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
