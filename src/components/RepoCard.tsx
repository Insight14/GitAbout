"use client";

import React, { useState } from "react";
import { ProjectDraft } from "@/lib/types";
import { BulletList } from "./BulletList";
import { SkillsList } from "./SkillsList";
import { MissingInfoPrompt } from "./MissingInfoPrompt";
import { InterviewPrepSection } from "./InterviewPrepSection";
import { formatDate } from "@/lib/utils";
import { ExternalLink, Star, Calendar, ChevronDown, ChevronUp, Award } from "lucide-react";

interface RepoCardProps {
  project: ProjectDraft;
  username: string;
}

export function RepoCard({ project, username }: RepoCardProps) {
  const [showScoreDetails, setShowScoreDetails] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {project.repo}
            </h3>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-mono bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/40"
              title="Open repository in GitHub"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <p className="text-sm text-slate-300 mt-1 italic">
            &ldquo;{project.summary}&rdquo;
          </p>
        </div>

        {/* Badges / Heuristic Breakdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated {formatDate(project.pushedAt)}</span>
          </div>

          {project.scoreBreakdown && (
            <button
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/30 transition-colors"
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
        <div className="bg-slate-900/90 rounded-lg p-3.5 border border-slate-800 text-xs space-y-2">
          <div className="font-semibold text-slate-300">
            Heuristic Ranking Factors:
          </div>
          <div className="flex flex-wrap gap-2">
            {project.scoreBreakdown.reasons.map((r, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-300 border border-slate-700/50"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bullets Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Evidence-Grounded Resume Bullets
        </h4>
        <BulletList bullets={project.bullets} repoUrl={project.repoUrl} />
      </div>

      {/* Skills Section */}
      <SkillsList skills={project.skills} />

      {/* Missing Info Prompt */}
      <MissingInfoPrompt questions={project.missing_info} />

      {/* Phase 2: Technical Interview Q&A Prep */}
      <InterviewPrepSection
        username={username}
        repoName={project.repo}
        pushedAt={project.pushedAt}
        repoUrl={project.repoUrl}
      />
    </div>
  );
}
