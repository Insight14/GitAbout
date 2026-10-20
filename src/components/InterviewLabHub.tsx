"use client";

import React, { useState } from "react";
import { ProjectDraft } from "@/lib/types";
import { InterviewPrepSection } from "./InterviewPrepSection";
import {
  Mic,
  FolderGit2,
  Sparkles,
  Timer,
  ShieldAlert,
  HelpCircle,
  Layers,
} from "lucide-react";

interface InterviewLabHubProps {
  username: string;
  projects: ProjectDraft[];
}

export function InterviewLabHub({ username, projects }: InterviewLabHubProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>(projects[0]?.repo || "");

  const activeProject = projects.find((p) => p.repo === selectedRepo) || projects[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-purple-900/40 bg-gradient-to-r from-purple-950/30 via-slate-900/80 to-slate-900/80 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-950/80 border border-pink-700/60 text-pink-300">
              <Mic className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Technical Interview Simulator & Question Studio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice answering deep technical questions on your architecture, engineering tradeoffs, failure scenarios, and honest repository weak spots with a realistic 2-minute timed mock mode.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-purple-300 bg-purple-950/60 px-3 py-1.5 rounded-xl border border-purple-800/50">
          <Timer className="w-4 h-4 text-pink-400" />
          <span>2-Minute Mock Timer Ready</span>
        </div>
      </div>

      {/* Interactive Project Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        <span className="text-xs text-slate-400 font-mono flex items-center gap-1 shrink-0 mr-1">
          <FolderGit2 className="w-3.5 h-3.5 text-purple-400" />
          <span>Select Repo:</span>
        </span>

        {projects.map((p) => {
          const isSelected = p.repo === selectedRepo;
          return (
            <button
              key={p.repo}
              onClick={() => setSelectedRepo(p.repo)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              <span>{p.repo}</span>
              {p.skills.length > 0 && (
                <span className="text-[10px] opacity-75 font-mono">
                  ({p.skills[0].name})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Project Interview Workspace */}
      {activeProject && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              Targeting repository <strong className="text-white font-mono">{activeProject.repo}</strong>
            </div>
            <span className="italic font-sans text-slate-500">
              &ldquo;{activeProject.summary}&rdquo;
            </span>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-purple-900/30 bg-slate-900/70 shadow-xl">
            <InterviewPrepSection
              username={username}
              repoName={activeProject.repo}
              pushedAt={activeProject.pushedAt}
              repoUrl={activeProject.repoUrl}
              defaultOpen={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
