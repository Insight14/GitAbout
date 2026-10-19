"use client";

import React from "react";
import { FileCode, GitCommit, PackageCheck, Bookmark } from "lucide-react";

interface EvidenceLinkProps {
  source: string;
  repoUrl?: string;
}

export function EvidenceLink({ source, repoUrl }: EvidenceLinkProps) {
  // Determine citation type icon
  const lower = source.toLowerCase();
  let Icon = Bookmark;
  let label = source;

  if (lower.startsWith("package.json") || lower.includes("dependencies") || lower.includes("cargo.toml") || lower.includes("requirements.txt")) {
    Icon = PackageCheck;
  } else if (lower.startsWith("commit:") || lower.includes("commit")) {
    Icon = GitCommit;
  } else if (lower.includes("readme") || lower.includes(".ts") || lower.includes(".js") || lower.includes(".py") || lower.includes("docker")) {
    Icon = FileCode;
  }

  // Attempt to build deep link if repoUrl exists and source is a file path
  let href: string | undefined;
  if (repoUrl && !lower.startsWith("commit:") && !lower.startsWith("repo metadata")) {
    const cleanPath = source.split(":")[0].replace(/^file:\s*/i, "").trim();
    if (cleanPath && !cleanPath.includes(" ")) {
      href = `${repoUrl}/blob/main/${cleanPath}`;
    }
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-blue-950/40 text-blue-300 border border-blue-800/40 hover:border-blue-700/60 transition-colors">
      <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
      <span className="truncate max-w-[280px]" title={source}>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-center gap-1"
          >
            <span>{label}</span>
          </a>
        ) : (
          label
        )}
      </span>
    </div>
  );
}
