"use client";

import React, { useState } from "react";
import { Copy, Check, ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { BulletPoint } from "@/lib/types";
import { EvidenceLink } from "./EvidenceLink";

interface BulletListProps {
  bullets: BulletPoint[];
  repoUrl: string;
}

export function BulletList({ bullets, repoUrl }: BulletListProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getConfidenceBadge = (confidence: BulletPoint["confidence"]) => {
    switch (confidence) {
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" /> High Confidence
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
            <Shield className="w-3 h-3" /> Inferred
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/40">
            <ShieldAlert className="w-3 h-3" /> Low Confidence
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {bullets.map((bullet, idx) => (
        <div
          key={idx}
          className="group relative p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <p className="text-sm text-slate-200 leading-relaxed font-sans">
                • {bullet.text}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {getConfidenceBadge(bullet.confidence)}
                <EvidenceLink source={bullet.source} repoUrl={repoUrl} />
              </div>
            </div>

            <button
              onClick={() => handleCopy(bullet.text, idx)}
              className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors shrink-0"
              title="Copy bullet"
              aria-label="Copy bullet"
            >
              {copiedIndex === idx ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
