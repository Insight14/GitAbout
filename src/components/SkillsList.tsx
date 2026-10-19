"use client";

import React from "react";
import { SkillEvidence } from "@/lib/types";
import { Wrench } from "lucide-react";

interface SkillsListProps {
  skills: SkillEvidence[];
}

export function SkillsList({ skills }: SkillsListProps) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Wrench className="w-3.5 h-3.5 text-purple-400" />
        <span>Verified Skills & Evidence</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.map((skill, idx) => (
          <div
            key={idx}
            className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-purple-950/30 border border-purple-800/40 text-purple-200"
          >
            <span className="font-medium text-slate-100">{skill.name}</span>
            <span className="text-purple-400/80 font-mono text-[11px]">
              ({skill.evidence})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
