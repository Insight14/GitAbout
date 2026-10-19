"use client";

import React, { useState, useEffect } from "react";
import { BulletPoint } from "@/lib/types";
import { EvidenceLink } from "./EvidenceLink";
import {
  Edit3,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Check,
  Copy,
  ShieldCheck,
  Shield,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface EditableBulletsProps {
  username: string;
  repoName: string;
  repoUrl: string;
  initialBullets: BulletPoint[];
  initialSummary: string;
  onUpdateDraft?: (bullets: BulletPoint[], summary: string) => void;
}

export function EditableBullets({
  username,
  repoName,
  repoUrl,
  initialBullets,
  initialSummary,
  onUpdateDraft,
}: EditableBulletsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bullets, setBullets] = useState<BulletPoint[]>(initialBullets);
  const [summary, setSummary] = useState(initialSummary);
  const [isSavedLocally, setIsSavedLocally] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  // Load custom edits from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`draft_override:${username}:${repoName}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
            setBullets(parsed.bullets);
            setIsSavedLocally(true);
          }
          if (typeof parsed.summary === "string" && parsed.summary.trim()) {
            setSummary(parsed.summary);
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
  }, [username, repoName]);

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSaveEdits = () => {
    const validBullets = bullets.filter((b) => b.text.trim().length > 0);
    const updatedPayload = {
      bullets: validBullets,
      summary: summary.trim(),
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `draft_override:${username}:${repoName}`,
        JSON.stringify(updatedPayload)
      );
    }

    setBullets(validBullets);
    setIsSavedLocally(true);
    setIsEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);

    if (onUpdateDraft) {
      onUpdateDraft(validBullets, summary.trim());
    }
  };

  const handleResetToAi = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(`draft_override:${username}:${repoName}`);
    }
    setBullets(initialBullets);
    setSummary(initialSummary);
    setIsSavedLocally(false);
    setIsEditing(false);

    if (onUpdateDraft) {
      onUpdateDraft(initialBullets, initialSummary);
    }
  };

  const handleAddBullet = () => {
    setBullets([
      ...bullets,
      {
        text: "Engineered scalable feature handling [X] users with [Y] performance improvement",
        source: "personal metric",
        confidence: "high",
      },
    ]);
  };

  const handleDeleteBullet = (index: number) => {
    const updated = bullets.filter((_, i) => i !== index);
    setBullets(updated);
  };

  const handleUpdateBulletText = (index: number, text: string) => {
    const updated = [...bullets];
    updated[index] = { ...updated[index], text };
    setBullets(updated);
  };

  const handleUpdateBulletSource = (index: number, source: string) => {
    const updated = [...bullets];
    updated[index] = { ...updated[index], source };
    setBullets(updated);
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
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Resume Bullets & Summary
          </span>
          {isSavedLocally && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800/40">
              Custom Edited
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isSavedLocally && !isEditing && (
            <button
              onClick={handleResetToAi}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
              title="Reset back to AI-generated draft"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to AI</span>
            </button>
          )}

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors"
            >
              <Edit3 className="w-3 h-3 text-blue-400" />
              <span>Edit Draft</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 rounded-md text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdits}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>Save Edits</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Editing */}
      {isEditing && (
        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Edit One-Sentence Summary:
          </label>
          <input
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full text-xs bg-slate-900 rounded p-2 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>
      )}

      {/* Bullets List / Editor */}
      <div className="space-y-3">
        {bullets.map((bullet, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2"
          >
            {!isEditing ? (
              // View Mode
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
                  onClick={() => handleCopyBullet(bullet.text, idx)}
                  className="p-1.5 rounded-md text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 transition-colors shrink-0"
                  title="Copy bullet"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
              // Edit Mode
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <textarea
                    value={bullet.text}
                    onChange={(e) => handleUpdateBulletText(idx, e.target.value)}
                    rows={2}
                    className="flex-1 text-xs bg-slate-950 rounded-lg p-2.5 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans resize-y"
                    placeholder="Enter bullet text with strong action verb and verified impact..."
                  />
                  <button
                    onClick={() => handleDeleteBullet(idx)}
                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/30 transition-colors"
                    title="Delete bullet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Citation:</span>
                  <input
                    type="text"
                    value={bullet.source}
                    onChange={(e) => handleUpdateBulletSource(idx, e.target.value)}
                    className="flex-1 text-[11px] bg-slate-950 rounded px-2 py-1 border border-slate-800 text-blue-300 font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Evidence citation (e.g. package.json, README.md, commit: ...)"
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Bullet Button in Edit Mode */}
        {isEditing && (
          <button
            onClick={handleAddBullet}
            className="w-full py-2.5 rounded-lg border border-dashed border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors bg-slate-950/40"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>Add Custom Metric or Impact Bullet</span>
          </button>
        )}
      </div>
    </div>
  );
}
