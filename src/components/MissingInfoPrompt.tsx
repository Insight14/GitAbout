"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp, Sparkles, MessageSquareQuote } from "lucide-react";

interface MissingInfoPromptProps {
  questions: string[];
}

export function MissingInfoPrompt({ questions }: MissingInfoPromptProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!questions || questions.length === 0) return null;

  return (
    <div className="rounded-lg bg-amber-950/20 border border-amber-800/40 p-3.5 space-y-2">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Impact Prompts — Add Your Metrics</span>
          <span className="text-[10px] bg-amber-900/50 text-amber-200 px-2 py-0.5 rounded-full border border-amber-700/50">
            {questions.length} question{questions.length === 1 ? "" : "s"}
          </span>
        </div>
        <button
          className="text-amber-400 hover:text-amber-200 p-1 rounded"
          aria-label={isOpen ? "Collapse prompts" : "Expand prompts"}
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <p className="text-xs text-amber-200/70">
        The repo context didn&apos;t contain metrics. Answer these during interview prep to elevate your draft:
      </p>

      {isOpen && (
        <ul className="space-y-2 pt-1">
          {questions.map((q, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs text-amber-100 bg-amber-950/40 p-2.5 rounded border border-amber-900/40"
            >
              <MessageSquareQuote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
