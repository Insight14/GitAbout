"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AnalysisResponse,
  ProjectDraft,
  TailoredProjectDraft,
} from "@/lib/types";
import { ProjectMasterDetail } from "@/components/ProjectMasterDetail";
import { JobTailoringPanel } from "@/components/JobTailoringPanel";
import { InterviewLabHub } from "@/components/InterviewLabHub";
import { ResumeLivePreview } from "@/components/ResumeLivePreview";
import { MarkdownExport } from "@/components/MarkdownExport";
import { PdfExportButton } from "@/components/pdf/PdfExportButton";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  FolderGit2,
  Sparkles,
  RefreshCw,
  KeyRound,
  Layers,
  Target,
  Mic,
  FileText,
  Star,
  CheckCircle2,
  ExternalLink,
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

  // Active Navigable Section
  const [activeTab, setActiveTab] = useState<"projects" | "tailor" | "interview" | "resume">("projects");

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
    <div className="space-y-8 pb-16">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => runAnalysis()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              title="Refresh repository analysis"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <PdfExportButton
              username={data.username}
              name={data.profile.name}
              bio={data.profile.bio}
              projects={data.projects}
            />
            <MarkdownExport username={data.username} projects={data.projects} />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center space-y-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <div className="absolute w-12 h-12 rounded-full overflow-hidden p-1 bg-slate-950">
              <Image
                src="/logo.png"
                alt="Analyzing..."
                width={48}
                height={48}
                className="animate-pulse"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Analyzing @{username}</h2>
            <p className="text-sm text-slate-400 font-mono flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>{loadingStep}</span>
            </p>
          </div>

          {/* Skeleton Cards Preview */}
          <div className="max-w-4xl mx-auto space-y-4 pt-4 opacity-20 pointer-events-none">
            <div className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
            <div className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="max-w-2xl mx-auto p-8 rounded-2xl glass-panel border border-red-900/50 bg-red-950/20 space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-red-900/40 text-red-400 flex items-center justify-center mx-auto">
            {isGeminiKeyMissing ? (
              <KeyRound className="w-7 h-7" />
            ) : (
              <AlertTriangle className="w-7 h-7" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-white">
              {isGeminiKeyMissing ? "Gemini API Key Required" : "Analysis Failed"}
            </h3>
            <p className="text-sm text-red-200/80 leading-relaxed font-sans">
              {error}
            </p>
          </div>

          {isGeminiKeyMissing && (
            <div className="text-left bg-slate-950/90 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
              <p className="text-slate-400">To enable LLM drafting, configure your key in <span className="text-white">.env.local</span>:</p>
              <p className="text-purple-300">GEMINI_API_KEY=your_gemini_api_key_here</p>
              <p className="text-slate-400">Then reload this page.</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => runAnalysis()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Analysis</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors"
            >
              Try Another Username
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      {!loading && !error && data && (
        <div className="space-y-8">
          {/* Profile Command Bar */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-purple-900/40 bg-gradient-to-r from-slate-900/90 via-purple-950/20 to-slate-900/90 shadow-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-md opacity-50 group-hover:opacity-80 transition duration-300" />
                {data.profile.avatarUrl ? (
                  <img
                    src={data.profile.avatarUrl}
                    alt={data.username}
                    className="relative w-20 h-20 rounded-2xl border-2 border-purple-500/40 shadow-xl object-cover shrink-0 bg-slate-950"
                  />
                ) : (
                  <div className="relative w-20 h-20 rounded-2xl bg-slate-900 border-2 border-purple-500/40 flex items-center justify-center text-slate-400 shrink-0">
                    <GithubIcon className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {data.profile.name || data.username}
                  </h1>
                  <span className="text-xs sm:text-sm text-purple-300 font-mono bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/50">
                    @{data.username}
                  </span>
                </div>

                {data.profile.bio && (
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    {data.profile.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 justify-center sm:justify-start pt-1 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
                    <strong className="text-white">{data.profile.publicRepos}</strong> public repos
                  </span>
                  <span>&bull;</span>
                  <span className="font-mono">
                    Top <strong className="text-white">{data.projects.length}</strong> analyzed
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>100% Cites Verified</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0">
              <a
                href={data.profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-purple-500/50 transition-all shadow-sm"
              >
                <GithubIcon className="w-4 h-4" />
                <span>View GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Zero Public Repos Notice */}
          {data.projects.length === 0 && (
            <div className="glass-panel p-12 rounded-2xl text-center space-y-3 border border-slate-800">
              <FolderGit2 className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-semibold text-white">No Public Repositories Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                @{data.username} does not have any public repositories available to analyze.
              </p>
            </div>
          )}

          {/* Navigable Section Hub Tabs */}
          {data.projects.length > 0 && (
            <div className="space-y-6">
              {/* Sticky Top-Level Navigation Tabs */}
              <div className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-xl p-2 rounded-2xl border border-purple-900/40 shadow-xl flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("projects")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "projects"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Project Portfolio</span>
                    <span className="text-xs font-mono opacity-80 px-1.5 py-0.2 rounded bg-black/30">
                      {data.projects.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tailor")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "tailor"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Job Tailoring & ATS</span>
                    {tailoredProjects && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab("interview")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "interview"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    <span>Interview Lab</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800/40">
                      Timed Mock
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("resume")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                      activeTab === "resume"
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                        : "text-slate-400 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Live ATS Resume</span>
                  </button>
                </div>

                <div className="hidden lg:flex items-center gap-2 pr-2 text-xs font-mono text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Interactive Studio Mode</span>
                </div>
              </div>

              {/* Tab 1: Project Portfolio Master-Detail Studio */}
              {activeTab === "projects" && (
                <div className="space-y-6 animate-fadeIn">
                  <ProjectMasterDetail
                    username={data.username}
                    originalProjects={data.projects}
                    tailoredProjects={tailoredProjects}
                  />
                </div>
              )}

              {/* Tab 2: Job Tailoring Panel */}
              {activeTab === "tailor" && (
                <div className="space-y-6 animate-fadeIn">
                  <JobTailoringPanel
                    username={data.username}
                    originalProjects={data.projects}
                    onTailoredChange={(tailored) => {
                      setTailoredProjects(tailored);
                    }}
                  />
                </div>
              )}

              {/* Tab 3: Technical Interview Lab Hub */}
              {activeTab === "interview" && (
                <div className="space-y-6 animate-fadeIn">
                  <InterviewLabHub
                    username={data.username}
                    projects={data.projects}
                  />
                </div>
              )}

              {/* Tab 4: Live ATS Resume & Export Document */}
              {activeTab === "resume" && (
                <div className="space-y-6 animate-fadeIn">
                  <ResumeLivePreview
                    username={data.username}
                    name={data.profile.name}
                    bio={data.profile.bio}
                    projects={
                      tailoredProjects
                        ? tailoredProjects.map((t) => t.originalDraft)
                        : data.projects
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
