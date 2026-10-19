import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ResumePdfDocument } from "@/components/pdf/ResumePdfDocument";
import { ProjectDraft } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const { username, name, bio, projects, jobTitle } = body || {};

    if (!username || !Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: "Username and at least one project are required to generate PDF." },
        { status: 400 }
      );
    }

    const doc = React.createElement(ResumePdfDocument, {
      username,
      name: name || null,
      bio: bio || null,
      projects: projects as ProjectDraft[],
      jobTitle: jobTitle || undefined,
    });

    const buffer = await renderToBuffer(doc as unknown as Parameters<typeof renderToBuffer>[0]);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${username}-github-resume.pdf"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to generate PDF resume.";
    console.error("[PDF Export API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
