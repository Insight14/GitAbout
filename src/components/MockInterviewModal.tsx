"use client";

import React, { useState, useEffect } from "react";
import { InterviewQuestion, WeakSpotFlag } from "@/lib/types";
import {
  Mic,
  Timer,
  CheckCircle,
  HelpCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  X,
  Play,
  Pause,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface MockInterviewModalProps {
  repoName: string;
  questions: InterviewQuestion[];
  weakSpots: WeakSpotFlag[];
  isOpen: boolean;
  onClose: () => void;
}

export function MockInterviewModal({
  repoName,
  questions,
  weakSpots,
  isOpen,
  onClose,
}: MockInterviewModalProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 minute timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [ratings, setRatings] = useState<Record<number, "good" | "practice">>({});

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen || questions.length === 0) return null;

  const currentQ = questions[currentIdx];

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(120);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setRevealed(false);
      resetTimer();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setRevealed(false);
      resetTimer();
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel border border-slate-700 bg-slate-900/95 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-600/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Mock Interview Mode</span>
                <span className="text-[10px] font-mono text-pink-300 bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-800/50">
                  {repoName}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Question {currentIdx + 1} of {questions.length} • Timed 2-Minute Rehearsal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Minute Practice Timer Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <Timer className="w-4 h-4 text-blue-400" />
            <span
              className={`font-bold text-sm ${
                timerSeconds < 30 ? "text-red-400 animate-pulse" : "text-white"
              }`}
            >
              {formatTimer(timerSeconds)}
            </span>
            <span className="text-slate-500 text-[11px]">(2 min answer target)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3 h-3 text-amber-400" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-emerald-400" /> Start Timer
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="p-1 text-slate-400 hover:text-white"
              title="Reset timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Question Card */}
        <div className="p-5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50 uppercase tracking-wider">
              {currentQ.category}
            </span>
            {currentQ.isRepoSilent && (
              <span className="text-[11px] font-medium text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                Repo is silent on this aspect
              </span>
            )}
          </div>

          <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
            &ldquo;{currentQ.question}&rdquo;
          </h4>

          {/* User Answer / Practice Notes Textarea */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-slate-400 font-medium block">
              Speak your answer out loud, then capture your bulleted talking points:
            </label>
            <textarea
              value={userNotes[currentIdx] || ""}
              onChange={(e) =>
                setUserNotes({ ...userNotes, [currentIdx]: e.target.value })
              }
              placeholder="e.g. 'I started by designing a modular pipeline in Python... We observed a bottleneck in regex parsing, which I resolved in commit xyz...'"
              rows={3}
              className="w-full text-xs bg-slate-900 rounded-lg p-3 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-y"
            />
          </div>
        </div>

        {/* Reveal Talking Points & Weak Spots */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Eye className="w-4 h-4 text-blue-400" />
            <span>Reveal Evidence-Backed Talking Points & Coaching</span>
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs animate-fade-in">
            {/* Talking Points */}
            <div className="space-y-2">
              <div className="font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evidence Talking Points</span>
              </div>
              <ul className="space-y-1.5 text-slate-200">
                {currentQ.talkingPoints.map((tp, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400">•</span>
                    <span>
                      {tp.point}{" "}
                      <span className="font-mono text-[10px] text-blue-300/80">
                        ({tp.evidence})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Answer Strategy */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 space-y-1">
              <div className="font-semibold text-white text-[11px] uppercase tracking-wider">
                Interview Delivery Strategy:
              </div>
              <p className="italic text-slate-200/90 leading-relaxed">
                {currentQ.suggestedAnswerStrategy}
              </p>
            </div>
          </div>
        )}

        {/* Self-Rating & Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Self-Rate:</span>
            <button
              onClick={() => setRatings({ ...ratings, [currentIdx]: "good" })}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                ratings[currentIdx] === "good"
                  ? "bg-emerald-600 text-white font-bold"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              ✓ Aced It
            </button>
            <button
              onClick={() => setRatings({ ...ratings, [currentIdx]: "practice" })}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                ratings[currentIdx] === "practice"
                  ? "bg-amber-600 text-white font-bold"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              ⚠ Need Practice
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentIdx === questions.length - 1}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
