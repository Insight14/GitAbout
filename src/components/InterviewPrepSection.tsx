"use client";

import React, { useState, useEffect } from "react";
import {
  ProjectInterviewPrep,
  QuestionCategory,
  InterviewQuestion,
} from "@/lib/types";
import { WeakSpotsList } from "./WeakSpotsList";
import { EvidenceLink } from "./EvidenceLink";
import { MockInterviewModal } from "./MockInterviewModal";
import {
  MessageSquareQuote,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Radio,
  FileQuestion,
  HelpCircle,
  Play,
  RotateCcw,
  Mic,
} from "lucide-react";

interface InterviewPrepSectionProps {
  username: string;
  repoName: string;
  pushedAt: string;
  repoUrl: string;
  defaultOpen?: boolean;
}

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  architecture: "Architecture & Design",
  tradeoffs: "Technical Tradeoffs",
  challenge: "Hardest Challenge",
  testing: "Testing & Correctness",
  scaling: "Scaling & Bottlenecks",
  improvements: "What Would You Change?",
};

export function InterviewPrepSection({
  username,
  repoName,
  pushedAt,
  repoUrl,
  defaultOpen = false,
}: InterviewPrepSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState<ProjectInterviewPrep | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [savedNoteIdx, setSavedNoteIdx] = useState<number | null>(null);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState<string>("");
  const [isMockModalOpen, setIsMockModalOpen] = useState(false);

  // Load saved notes from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`prep_notes:${username}:${repoName}`);
      if (stored) {
        try {
          setNotes(JSON.parse(stored));
        } catch {
          // Ignore
        }
      }
    }
  }, [username, repoName]);

  const handleSaveNote = (qIdx: number, text: string) => {
    const updated = { ...notes, [qIdx]: text };
    setNotes(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(`prep_notes:${username}:${repoName}`, JSON.stringify(updated));
    }
    setSavedNoteIdx(qIdx);
    setTimeout(() => setSavedNoteIdx(null), 2000);
  };

  const fetchPrep = async () => {
    if (prepData) return;
    setLoading(true);
    try {
      const res = await fetch("/api/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, repoName, pushedAt }),
      });
      const json = await res.json();
      if (res.ok && json.prep) {
        setPrepData(json.prep);
      }
    } catch (err) {
      console.error("Failed to load interview prep:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen && !prepData) {
      fetchPrep();
    }
    setIsOpen(!isOpen);
  };

  const startStream = async () => {
    setIsStreaming(true);
    setStreamContent("");
    try {
      const res = await fetch("/api/prep/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, repoName }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Streaming connection failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setStreamContent((prev) => prev + chunk);
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
    } finally {
      setIsStreaming(false);
    }
  };

  const filteredQuestions = prepData
    ? selectedCategory === "all"
      ? prepData.questions
      : prepData.questions.filter((q) => q.category === selectedCategory)
    : [];

  return (
    <div className="rounded-xl border border-blue-900/40 bg-blue-950/10 overflow-hidden transition-all">
      {/* Header Button */}
      <button
        onClick={handleToggle}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-950/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <MessageSquareQuote className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Technical Interview Q&A Prep</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-200 border border-blue-700/50">
                Phase 2
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Evidence-grounded talking points, questions where the repo is silent, & weak spot flags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs font-mono hidden sm:inline">
            {isOpen ? "Collapse Prep" : "Open Prep"}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-5 pt-2 border-t border-blue-900/40 space-y-6">
          {/* Loading */}
          {loading && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                Synthesizing interview questions, citations, and weak spot analysis...
              </p>
            </div>
          )}

          {!loading && prepData && (
            <div className="space-y-6">
              {/* Weak Spots Analysis */}
              <WeakSpotsList weakSpots={prepData.weakSpots} />

              {/* Streaming AI Coach & Mock Interview Practice Mode */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                    <span>Real-Time AI Coach & Practice Mode</span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Stream live architectural analysis or enter timed 2-minute mock practice mode
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    onClick={() => setIsMockModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-pink-600 hover:bg-pink-500 text-white font-medium transition-colors shadow-sm"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Mock Interview Mode</span>
                  </button>

                  <button
                    onClick={startStream}
                    disabled={isStreaming}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-medium transition-colors border border-slate-700"
                  >
                    {isStreaming ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Streaming...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Stream Coach</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mock Interview Modal */}
              <MockInterviewModal
                repoName={repoName}
                questions={prepData.questions}
                weakSpots={prepData.weakSpots}
                isOpen={isMockModalOpen}
                onClose={() => setIsMockModalOpen(false)}
              />

              {/* Stream output box */}
              {streamContent && (
                <div className="p-4 rounded-xl bg-slate-950 border border-pink-900/40 text-xs space-y-2">
                  <div className="flex items-center justify-between text-pink-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Live AI Coach Output
                    </span>
                    <button
                      onClick={() => setStreamContent("")}
                      className="text-slate-400 hover:text-white"
                      title="Clear stream output"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                    {streamContent}
                  </div>
                </div>
              )}

              {/* Category Filter Pills */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Filter by Question Type:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      selectedCategory === "all"
                        ? "bg-blue-600 text-white font-semibold"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    All Questions ({prepData.questions.length})
                  </button>

                  {(
                    [
                      "architecture",
                      "tradeoffs",
                      "challenge",
                      "testing",
                      "scaling",
                      "improvements",
                    ] as QuestionCategory[]
                  ).map((cat) => {
                    const count = prepData.questions.filter((q) => q.category === cat).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                          selectedCategory === cat
                            ? "bg-blue-600 text-white font-semibold"
                            : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                        }`}
                      >
                        {CATEGORY_LABELS[cat]} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.map((q, idx) => {
                  const globalIdx = prepData.questions.indexOf(q);
                  const currentNote = notes[globalIdx] || "";

                  return (
                    <div
                      key={globalIdx}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3.5 hover:border-slate-700 transition-all"
                    >
                      {/* Question Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 w-fit">
                          {CATEGORY_LABELS[q.category]}
                        </span>

                        {q.isRepoSilent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 w-fit">
                            <HelpCircle className="w-3 h-3" /> Repo is silent — fill this in
                          </span>
                        )}
                      </div>

                      {/* Question Title */}
                      <h5 className="text-sm font-bold text-white leading-snug">
                        {q.question}
                      </h5>

                      {/* Evidence-grounded Talking Points */}
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Evidence-Grounded Talking Points:
                        </div>
                        <ul className="space-y-2">
                          {q.talkingPoints.map((tp, tpIdx) => (
                            <li
                              key={tpIdx}
                              className="text-xs text-slate-200 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60 space-y-1.5"
                            >
                              <div className="leading-relaxed">• {tp.point}</div>
                              <div className="pt-0.5">
                                <EvidenceLink source={tp.evidence} repoUrl={repoUrl} />
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Answer Strategy Guide */}
                      {q.suggestedAnswerStrategy && (
                        <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/30 text-xs text-blue-200 space-y-1">
                          <strong className="text-[11px] uppercase tracking-wider text-blue-300 block">
                            Strategy to Ace this Answer:
                          </strong>
                          <p className="leading-relaxed text-blue-100/90 italic">
                            {q.suggestedAnswerStrategy}
                          </p>
                        </div>
                      )}

                      {/* Interactive Rehearsal Notes Box */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-900">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">
                            Your Personal Rehearsal Notes:
                          </span>
                          {savedNoteIdx === globalIdx && (
                            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                              <Check className="w-3 h-3" /> Saved!
                            </span>
                          )}
                        </div>

                        <textarea
                          value={currentNote}
                          onChange={(e) =>
                            setNotes({ ...notes, [globalIdx]: e.target.value })
                          }
                          placeholder="Jot down your specific numbers, user metrics, or anecdotes for this question..."
                          rows={2}
                          className="w-full text-xs bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-y"
                        />

                        <div className="flex justify-end">
                          <button
                            onClick={() => handleSaveNote(globalIdx, currentNote)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-medium transition-colors"
                          >
                            <Save className="w-3 h-3" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
