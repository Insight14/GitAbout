"use client";

import React, { useState } from "react";
import {
  ProjectDraft,
  JobTailoringResult,
  TailoredProjectDraft,
} from "@/lib/types";
import {
  Briefcase,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowUpDown,
  FileText,
  Copy,
  Check,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface JobTailoringPanelProps {
  username: string;
  originalProjects: ProjectDraft[];
  onTailoredChange: (tailoredProjects: TailoredProjectDraft[] | null) => void;
}

const PRESET_JDS = [
  {
    title: "Backend / Distributed Systems Engineer",
    company: "High-Growth Cloud Platform",
    text: `We are seeking a Backend Engineer with deep Python or Go experience building scalable distributed APIs and data pipelines.
Required Qualifications:
- Strong proficiency in Python or Golang with microservices architecture
- Hands-on experience with Redis caching, PostgreSQL/MySQL, and REST APIs
- Containerization with Docker; familiarity with Kubernetes is a strong plus
- Message brokers (Kafka or RabbitMQ) and background worker systems
- Strong focus on performance profiling and concurrency`,
  },
  {
    title: "Computer Vision & Machine Learning Engineer",
    company: "Autonomous Vision Labs",
    text: `Looking for a Computer Vision Engineer to develop real-time player and object tracking algorithms.
Requirements:
- Strong experience with Python, OpenCV, and deep learning frameworks (PyTorch or TensorFlow)
- Background in video processing, object detection, and feature extraction
- Experience deploying containerized models with Docker on cloud infrastructure
- Performance optimization and low-latency inference pipelines`,
  },
  {
    title: "Full-Stack Software Engineer",
    company: "Next-Gen SaaS",
    text: `We need a versatile Full-Stack Engineer to architect modern web applications from frontend to backend.
Requirements:
- Proficiency in TypeScript, React, Next.js, and Node.js
- Designing robust REST and GraphQL APIs with PostgreSQL databases
- Modern styling with Tailwind CSS and responsive UI components
- Containerization, CI/CD pipelines, and automated test-driven development`,
  },
];

export function JobTailoringPanel({
  username,
  originalProjects,
  onTailoredChange,
}: JobTailoringPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobText, setJobText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobTailoringResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [showGapsDetails, setShowGapsDetails] = useState(true);

  const handleSelectPreset = (preset: (typeof PRESET_JDS)[0]) => {
    setJobTitle(preset.title);
    setCompany(preset.company);
    setJobText(preset.text);
  };

  const handleRunTailoring = async () => {
    if (!jobText.trim() || jobText.trim().length < 15) {
      setError("Please paste a job description with at least 15 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: jobTitle.trim() || undefined,
          company: company.trim() || undefined,
          jobDescription: jobText.trim(),
          projects: originalProjects,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || `Tailoring failed with status ${res.status}`);
      }

      setResult(json);
      onTailoredChange(json.tailoredProjects);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tailoring request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    onTailoredChange(null);
  };

  const handleCopyTailoredMarkdown = () => {
    if (!result) return;
    const lines: string[] = [];
    lines.push(`# Tailored Resume Draft: ${result.jobTitle} ${result.company ? `at ${result.company}` : ""}`);
    lines.push(`*Targeted alignment draft for @${username} • Match Score: ${result.matchScore}%*\n`);
    lines.push(`## Role Match Summary\n${result.overallSummary}\n`);

    lines.push(`## Verified Matching Qualifications`);
    for (const m of result.matchedSkills) {
      lines.push(`- **${m.skill}**: verified in \`${m.matchedRepo}\` (${m.notes || m.evidence})`);
    }
    lines.push("");

    if (result.missingSkills.length > 0) {
      lines.push(`## Honest Skill Gaps & Interview Talking Points`);
      for (const gap of result.missingSkills) {
        const tp = result.interviewTalkingPointsForGaps.find(
          (t) => t.missingSkill.toLowerCase() === gap.skill.toLowerCase()
        );
        lines.push(`- **${gap.skill}** [${gap.status.toUpperCase()}]: ${gap.notes}`);
        if (tp) {
          lines.push(`  *How to answer in interview:* ${tp.recommendation}`);
        }
      }
      lines.push("");
    }

    lines.push(`## Targeted Projects (Re-ordered by Role Relevance)\n`);
    for (const proj of result.tailoredProjects) {
      lines.push(`### ${proj.repo} (Relevance Score: ${proj.relevanceScore}/100)`);
      lines.push(`*${proj.relevanceReason}*\n`);
      for (const b of proj.highlightedBullets) {
        const star = b.isDirectMatch ? "★ " : "- ";
        lines.push(`${star}${b.text} *(Evidence: ${b.source})*`);
      }
      lines.push("");
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl glass-panel border border-purple-900/50 overflow-hidden shadow-2xl transition-all">
      {/* Banner / Header Bar */}
      <div className="p-5 bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Phase 3: Job Description Tailoring</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 border border-purple-700/60">
                Zero Hallucination
              </span>
            </h3>
            <p className="text-xs text-slate-300">
              Re-rank your projects, highlight matching evidence, & honestly flag missing requirements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Original</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isOpen ? "Close Tailor Panel" : result ? "Edit Job Description" : "Tailor for a Job"}</span>
          </button>
        </div>
      </div>

      {/* Input Drawer */}
      {isOpen && (
        <div className="p-6 space-y-5 bg-slate-950/90 border-b border-purple-900/40">
          {/* Quick Presets */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Role Presets:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_JDS.map((p) => (
                <button
                  key={p.title}
                  onClick={() => handleSelectPreset(p)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 hover:bg-purple-950/60 text-slate-200 hover:text-purple-200 border border-slate-800 hover:border-purple-800/60 transition-all text-left"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-[10px] text-slate-400">{p.company}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Target Job Title (Optional)
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full text-xs bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Stripe, OpenAI, Datadog"
                className="w-full text-xs bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">
              Job / Internship Description (Paste full text or requirements)
            </label>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the full job requirements, tech stack, and responsibilities here..."
              rows={6}
              className="w-full text-xs bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRunTailoring}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-600/30 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Match & Re-ranking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tailor My Drafts</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tailoring Results Dashboard */}
      {result && (
        <div className="p-6 space-y-6">
          {/* Top Score Banner */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-xl bg-purple-950/20 border border-purple-800/40">
            <div className="flex items-center gap-5">
              {/* Circular Match Gauge */}
              <div className="relative w-20 h-20 rounded-full border-4 border-purple-900/40 flex items-center justify-center shrink-0 bg-slate-950">
                <div
                  className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin-slow"
                  style={{ transform: `rotate(${result.matchScore * 3.6}deg)` }}
                />
                <div className="text-center">
                  <span className="text-xl font-extrabold text-white leading-none">
                    {result.matchScore}%
                  </span>
                  <span className="text-[9px] uppercase font-mono text-purple-300 block">
                    Match
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-lg font-bold text-white">
                    {result.jobTitle}
                  </h4>
                  {result.company && (
                    <span className="text-xs text-purple-300 font-medium px-2 py-0.5 rounded bg-purple-950 border border-purple-800/40">
                      @{result.company}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  {result.overallSummary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyTailoredMarkdown}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied Tailored Markdown!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tailored Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Matching Skills ({result.matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map((m, i) => (
                  <div
                    key={i}
                    className="group relative inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-emerald-950/40 border border-emerald-800/40 text-emerald-200"
                    title={m.notes}
                  >
                    <span className="font-semibold text-white">{m.skill}</span>
                    {m.matchedRepo && (
                      <span className="text-[10px] text-emerald-400/80 font-mono">
                        ({m.matchedRepo})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Honest Missing Skills Gaps */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Honest Gaps Detected ({result.missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map((g, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-amber-950/40 border border-amber-800/40 text-amber-200"
                    title={g.notes}
                  >
                    <span className="font-semibold">{g.skill}</span>
                    <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-amber-900/60 text-amber-300">
                      {g.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bridge The Gap Interview Advice */}
          {result.interviewTalkingPointsForGaps.length > 0 && (
            <div className="rounded-xl bg-amber-950/15 border border-amber-900/40 p-4 space-y-3">
              <div
                className="flex items-center justify-between cursor-pointer select-none"
                onClick={() => setShowGapsDetails(!showGapsDetails)}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Interview Strategy: How to Bridge These Gaps</span>
                </div>
                <button
                  className="text-amber-400 p-1"
                  aria-label={showGapsDetails ? "Collapse" : "Expand"}
                >
                  {showGapsDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showGapsDetails && (
                <div className="space-y-2.5 pt-1">
                  {result.interviewTalkingPointsForGaps.map((tp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/80 border border-amber-900/30 text-xs space-y-1"
                    >
                      <div className="font-semibold text-amber-200">
                        When asked about <span className="underline">{tp.missingSkill}</span>:
                      </div>
                      <p className="text-amber-100/80 italic leading-relaxed font-sans">
                        &ldquo;{tp.recommendation}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Re-ranked Projects Notice */}
          <div className="flex items-center gap-2 text-xs text-purple-300 font-mono bg-purple-950/40 p-3 rounded-xl border border-purple-900/40">
            <ArrowUpDown className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Your public projects below have been dynamically re-ranked based on role alignment. Starred bullets (★) directly touch on JD requirements.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
