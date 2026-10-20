import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import fs from "fs";
import path from "path";
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

    let logoBase64: string | undefined;
    try {
      const logoPath = path.join(process.cwd(), "public", "logo-sm.png");
      if (fs.existsSync(logoPath)) {
        const fileBuf = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${fileBuf.toString("base64")}`;
      }
    } catch {
      // Continue without logo if file reading fails
    }

    const doc = React.createElement(ResumePdfDocument, {
      username,
      name: name || null,
      bio: bio || null,
      projects: projects as ProjectDraft[],
      jobTitle: jobTitle || undefined,
      logoSrc: logoBase64,
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
