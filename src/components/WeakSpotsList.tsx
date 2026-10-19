"use client";

import React from "react";
import { WeakSpotFlag } from "@/lib/types";
import { AlertCircle, Lightbulb, ShieldAlert } from "lucide-react";

interface WeakSpotsListProps {
  weakSpots: WeakSpotFlag[];
}

export function WeakSpotsList({ weakSpots }: WeakSpotsListProps) {
  if (!weakSpots || weakSpots.length === 0) return null;

  return (
    <div className="rounded-xl bg-amber-950/20 border border-amber-900/50 p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-amber-400" />
        <span>Honest Weak Spots — Flagged for Rehearsal</span>
        <span className="text-[10px] bg-amber-900/50 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700/50">
          {weakSpots.length} detected
        </span>
      </div>

      <p className="text-xs text-amber-200/70">
        Interviewers will spot these gaps. Rehearse acknowledging them with engineering maturity instead of getting defensive:
      </p>

      <div className="space-y-2.5 pt-1">
        {weakSpots.map((spot, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-slate-950/80 border border-amber-900/40 space-y-2 text-xs"
          >
            <div className="flex items-center gap-1.5 font-semibold text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{spot.area}</span>
            </div>

            <p className="text-slate-300 leading-relaxed pl-5 font-sans">
              {spot.description}
            </p>

            <div className="ml-5 p-2 rounded bg-amber-950/40 border border-amber-800/30 text-amber-100 flex items-start gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-200 block text-[11px] uppercase tracking-wider">
                  How to answer in an interview:
                </strong>
                <span className="text-xs italic leading-relaxed text-amber-100/90">
                  {spot.rehearsalTip}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
