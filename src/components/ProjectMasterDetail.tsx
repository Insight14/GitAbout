"use client";

import React, { useState } from "react";
import { ProjectDraft, TailoredProjectDraft } from "@/lib/types";
import { RepoCard } from "./RepoCard";
import {
  FolderGit2,
  Calendar,
  Award,
  ChevronRight,
  LayoutGrid,
  Columns,
  Star,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectMasterDetailProps {
  username: string;
  originalProjects: ProjectDraft[];
  tailoredProjects: TailoredProjectDraft[] | null;
}

export function ProjectMasterDetail({
  username,
  originalProjects,
  tailoredProjects,
}: ProjectMasterDetailProps) {
  const [selectedRepo, setSelectedRepo] = useState<string>(
    tailoredProjects ? tailoredProjects[0]?.repo : originalProjects[0]?.repo || ""
  );
  const [viewMode, setViewMode] = useState<"master-detail" | "list">("master-detail");

  const effectiveProjects = tailoredProjects
    ? tailoredProjects.map((t) => ({
        project: t.originalDraft,
        relevanceScore: t.relevanceScore,
        relevanceReason: t.relevanceReason,
        isTailored: true,
      }))
    : originalProjects.map((p) => ({
        project: p,
        relevanceScore: undefined,
        relevanceReason: undefined,
        isTailored: false,
      }));

  const activeItem =
    effectiveProjects.find((item) => item.project.repo === selectedRepo) ||
    effectiveProjects[0];

  return (
    <div className="space-y-6">
      {/* View Mode Controls & Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <span>{tailoredProjects ? "Role-Tailored Project Studio" : "Candidate Project Studio"}</span>
            {tailoredProjects && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800/50">
                Tailored
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">
            {tailoredProjects
              ? "Re-ordered based on role relevance with direct qualification matches highlighted."
              : "Ranked deterministically by code density, commit history, and verified documentation."}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode("master-detail")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "master-detail"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Studio View</span>
          </button>

          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "list"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>List All</span>
          </button>
        </div>
      </div>

      {/* Render Master-Detail View */}
      {viewMode === "master-detail" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Master Rail (Project Selector) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between px-1">
              <span>RANKED REPOSITORIES ({effectiveProjects.length})</span>
              <span>CLICK TO INSPECT</span>
            </div>

            <div className="space-y-2.5">
              {effectiveProjects.map((item, idx) => {
                const isSelected = item.project.repo === activeItem?.project.repo;
                return (
                  <button
                    key={item.project.repo}
                    onClick={() => setSelectedRepo(item.project.repo)}
                    className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between gap-3 group cursor-pointer ${
                      isSelected
                        ? "bg-purple-950/40 border-purple-500/70 shadow-lg shadow-purple-950/40"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                            isSelected
                              ? "bg-purple-600 text-white"
                              : "bg-slate-800 text-slate-400 group-hover:text-white"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <h4
                          className={`font-bold text-sm truncate ${
                            isSelected ? "text-white" : "text-slate-200 group-hover:text-white"
                          }`}
                        >
                          {item.project.repo}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-400 truncate italic">
                        {item.project.summary}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 font-mono flex-wrap">
                        {item.isTailored && typeof item.relevanceScore === "number" ? (
                          <span className="text-purple-300 font-semibold bg-purple-950/70 px-1.5 py-0.5 rounded border border-purple-800/50">
                            {item.relevanceScore}% match
                          </span>
                        ) : item.project.scoreBreakdown ? (
                          <span className="text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-800/40">
                            Score: {item.project.scoreBreakdown.totalScore}
                          </span>
                        ) : null}

                        <span>Updated {formatDate(item.project.pushedAt)}</span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? "text-purple-400 translate-x-1"
                          : "text-slate-600 group-hover:text-slate-400"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Detail Workspace */}
          <div className="lg:col-span-8">
            {activeItem && (
              <RepoCard
                key={activeItem.project.repo}
                project={activeItem.project}
                username={username}
                relevanceScore={activeItem.relevanceScore}
                relevanceReason={activeItem.relevanceReason}
                isTailored={activeItem.isTailored}
              />
            )}
          </div>
        </div>
      ) : (
        /* Render Full List View */
        <div className="space-y-6">
          {effectiveProjects.map((item) => (
            <RepoCard
              key={item.project.repo}
              project={item.project}
              username={username}
              relevanceScore={item.relevanceScore}
              relevanceReason={item.relevanceReason}
              isTailored={item.isTailored}
            />
          ))}
        </div>
      )}
    </div>
  );
}
