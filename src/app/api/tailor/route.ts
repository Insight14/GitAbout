import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { tailorProjectsToJob } from "@/lib/tailoring/tailorToJob";
import { ProjectDraft, JobDescriptionInput } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateResult = await checkRateLimit(clientIp);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const { jobTitle, company, jobDescription, projects } = body || {};

    if (!jobDescription || typeof jobDescription !== "string" || jobDescription.trim().length < 15) {
      return NextResponse.json(
        { error: "Please provide a valid job description with at least 15 characters." },
        { status: 400 }
      );
    }

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: "At least one project draft is required for job tailoring." },
        { status: 400 }
      );
    }

    const jobInput: JobDescriptionInput = {
      jobTitle: typeof jobTitle === "string" ? jobTitle : undefined,
      company: typeof company === "string" ? company : undefined,
      jobText: jobDescription,
    };

    const result = await tailorProjectsToJob(projects as ProjectDraft[], jobInput);

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Tailoring pipeline encountered an error.";
    console.error("[Tailor API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
