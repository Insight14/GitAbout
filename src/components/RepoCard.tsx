"use client";

import React, { useState } from "react";
import { ProjectDraft } from "@/lib/types";
import { EditableBullets } from "./EditableBullets";
import { SkillsList } from "./SkillsList";
import { MissingInfoPrompt } from "./MissingInfoPrompt";
import { InterviewPrepSection } from "./InterviewPrepSection";
import { formatDate } from "@/lib/utils";
import {
  ExternalLink,
  Calendar,
  ChevronDown,
  ChevronUp,
  Award,
  FileText,
  Cpu,
  HelpCircle,
  Mic,
  LayoutGrid,
} from "lucide-react";

interface RepoCardProps {
  project: ProjectDraft;
  username: string;
  relevanceScore?: number;
  relevanceReason?: string;
  isTailored?: boolean;
}

export function RepoCard({
  project,
  username,
  relevanceScore,
  relevanceReason,
  isTailored,
}: RepoCardProps) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [activeSection, setActiveSection] = useState<"all" | "bullets" | "skills" | "missing" | "prep">("bullets");

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl border border-slate-800/80 hover:border-purple-900/50 transition-all bg-slate-900/70">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {project.repo}
            </h3>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-purple-300 hover:text-white font-mono bg-purple-950/60 px-2.5 py-0.5 rounded-lg border border-purple-800/50 transition-colors"
              title="Open repository on GitHub"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-sm text-slate-300 italic">
            &ldquo;{project.summary}&rdquo;
          </p>

          {isTailored && relevanceReason && (
            <p className="text-xs text-purple-200 font-medium mt-1 inline-flex items-center gap-1.5 bg-purple-950/70 px-2.5 py-1 rounded-lg border border-purple-800/60">
              <span>🎯 {relevanceReason}</span>
            </p>
          )}
        </div>

        {/* Badges & Heuristics */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          {isTailored && typeof relevanceScore === "number" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-purple-950/80 text-purple-200 border border-purple-600/70 shadow-md">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Role Match: {relevanceScore}%</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated {formatDate(project.pushedAt)}</span>
          </div>

          {project.scoreBreakdown && (
            <button
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 hover:bg-emerald-900/40 transition-colors cursor-pointer"
              title="View heuristic score breakdown"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Score: {project.scoreBreakdown.totalScore}</span>
              {showScoreDetails ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Score details accordion */}
      {showScoreDetails && project.scoreBreakdown && (
        <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800 text-xs space-y-2.5 animate-fadeIn">
          <div className="font-semibold text-slate-200 flex items-center justify-between">
            <span>Deterministic Ranking Factors</span>
            <span className="text-[10px] font-mono text-slate-400">Score: {project.scoreBreakdown.totalScore}/100</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.scoreBreakdown.reasons.map((r, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px]"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Navigable Sub-Section Selector Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSection("bullets")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "bullets"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume Bullets</span>
            <span className="text-[10px] opacity-75 font-mono">({project.bullets.length})</span>
          </button>

          <button
            onClick={() => setActiveSection("skills")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "skills"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Tech Stack</span>
            <span className="text-[10px] opacity-75 font-mono">({project.skills.length})</span>
          </button>

          <button
            onClick={() => setActiveSection("missing")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "missing"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Metrics Boosters</span>
            {project.missing_info.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveSection("prep")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSection === "prep"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/40"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>
        </div>

        <button
          onClick={() => setActiveSection(activeSection === "all" ? "bullets" : "all")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors shrink-0 ${
            activeSection === "all"
              ? "bg-slate-800 text-white border border-purple-500/50"
              : "text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800"
          }`}
          title="Toggle view of all sub-sections at once"
        >
          <LayoutGrid className="w-3 h-3" />
          <span>{activeSection === "all" ? "Tabbed View" : "View All"}</span>
        </button>
      </div>

      {/* Render Active Sub-Section */}
      <div className="space-y-6">
        {(activeSection === "bullets" || activeSection === "all") && (
          <div className="space-y-2">
            {activeSection === "all" && (
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Bullets</span>
              </div>
            )}
            <EditableBullets
              username={username}
              repoName={project.repo}
              repoUrl={project.repoUrl}
              initialBullets={project.bullets}
              initialSummary={project.summary}
            />
          </div>
        )}

        {(activeSection === "skills" || activeSection === "all") && (
          <div className="space-y-2">
            {activeSection === "all" && (
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>Verified Dependencies & Technologies</span>
              </div>
            )}
            <SkillsList skills={project.skills} />
          </div>
        )}

        {(activeSection === "missing" || activeSection === "all") && (
          <div className="space-y-2">
            {activeSection === "all" && (
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Missing Business Impact Inquiries</span>
              </div>
            )}
            <MissingInfoPrompt questions={project.missing_info} />
          </div>
        )}

        {(activeSection === "prep" || activeSection === "all") && (
          <div className="space-y-2">
            {activeSection === "all" && (
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <Mic className="w-3.5 h-3.5 text-pink-400" />
                <span>Technical Interview Prep Studio</span>
              </div>
            )}
            <InterviewPrepSection
              username={username}
              repoName={project.repo}
              pushedAt={project.pushedAt}
              repoUrl={project.repoUrl}
              defaultOpen={activeSection === "prep"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
