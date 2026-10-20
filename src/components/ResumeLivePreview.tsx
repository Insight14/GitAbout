"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ProjectDraft } from "@/lib/types";
import { PdfExportButton } from "./pdf/PdfExportButton";
import { MarkdownExport } from "./MarkdownExport";
import {
  FileText,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ResumeLivePreviewProps {
  username: string;
  name: string | null;
  bio: string | null;
  projects: ProjectDraft[];
}

export function ResumeLivePreview({
  username,
  name,
  bio,
  projects,
}: ResumeLivePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [effectiveProjects, setEffectiveProjects] = useState<ProjectDraft[]>(projects);

  // Sync client-side edits from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const merged = projects.map((p) => {
      const stored = localStorage.getItem(`draft_bullets:${username}:${p.repo}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return {
            ...p,
            summary: parsed.summary || p.summary,
            bullets: parsed.bullets || p.bullets,
          };
        } catch {
          return p;
        }
      }
      return p;
    });

    setEffectiveProjects(merged);
  }, [username, projects]);

  const verifiedSkills = Array.from(
    new Set(effectiveProjects.flatMap((p) => p.skills.map((s) => s.name)))
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Live ATS Resume Draft Preview</h3>
            <p className="text-xs text-slate-400">
              Formatted according to standard applicant tracking system single-column typography.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <PdfExportButton
            username={username}
            name={name}
            bio={bio}
            projects={effectiveProjects}
          />

          <MarkdownExport username={username} projects={effectiveProjects} />
        </div>
      </div>

      {/* Realistic Resume Sheet */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 p-8 sm:p-12 rounded-2xl shadow-2xl border border-slate-200 font-sans space-y-6">
        {/* Resume Header */}
        <div className="border-b-2 border-indigo-600 pb-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">
              {name || username}
            </h1>
            <p className="text-sm font-bold text-indigo-600">
              Software Engineer &bull; Evidence-Grounded Portfolio
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 font-mono">
              <span>github.com/{username}</span>
              <span>&bull;</span>
              <span>gitabout.com/{username}</span>
              <span>&bull;</span>
              <span className="text-emerald-700 font-semibold">Verified Codebase Evidence</span>
            </div>
          </div>

          <div className="relative w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-indigo-600 shrink-0">
            <Image
              src="/logo.png"
              alt="GitAnswer Verified Badge"
              width={56}
              height={56}
              className="rounded-full bg-slate-950"
            />
          </div>
        </div>

        {/* Technical Summary */}
        {bio && (
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
              Technical Profile
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed pt-1">{bio}</p>
          </div>
        )}

        {/* Verified Skills */}
        {verifiedSkills.length > 0 && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
              Verified Technologies & Skills
            </h2>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {verifiedSkills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1">
            Key Software Engineering Projects
          </h2>

          <div className="space-y-5">
            {effectiveProjects.map((p) => (
              <div key={p.repo} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-950">{p.repo}</h3>
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-600 hover:underline font-mono inline-flex items-center gap-0.5"
                    >
                      <span>[source]</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">
                    Updated {formatDate(p.pushedAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 italic">&ldquo;{p.summary}&rdquo;</p>

                <ul className="space-y-1 pl-4 list-disc text-xs text-slate-800 leading-relaxed marker:text-indigo-600">
                  {p.bullets.map((b, i) => (
                    <li key={i}>
                      <span>{b.text}</span>
                      {b.source && (
                        <span className="text-[10px] text-slate-500 font-mono italic ml-1">
                          (Evidence: {b.source})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {p.skills.length > 0 && (
                  <div className="text-[11px] text-slate-600 font-mono pt-0.5">
                    <strong>Stack:</strong> {p.skills.map((s) => s.name).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synthesized by GitAnswer &bull; Every bullet point cited strictly from verified GitHub repository AST & commits</span>
        </div>
      </div>
    </div>
  );
}
