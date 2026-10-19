"use client";

import React, { useState } from "react";
import { ProjectDraft } from "@/lib/types";
import { FileDown, Loader2, Check } from "lucide-react";

interface PdfExportButtonProps {
  username: string;
  name: string | null;
  bio: string | null;
  projects: ProjectDraft[];
  jobTitle?: string;
}

export function PdfExportButton({
  username,
  name,
  bio,
  projects,
  jobTitle,
}: PdfExportButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          name,
          bio,
          projects,
          jobTitle,
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-github-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPdf}
      disabled={downloading}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white shadow-md shadow-blue-600/30 transition-all"
      title="Download ATS-Friendly PDF Resume"
    >
      {downloading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : success ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-300" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5" />
          <span>Download PDF</span>
        </>
      )}
    </button>
  );
}
