import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { fetchUserRepos, fetchRepoDetail } from "@/lib/github/fetchProfile";
import { buildRepoContext } from "@/lib/context/buildRepoContext";
import { generateInterviewPrep } from "@/lib/llm/interviewPrep";
import { getPrepCache, setPrepCache, getGitHubCache, setGitHubCache } from "@/lib/cache";
import { ProjectInterviewPrep } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateResult = await checkRateLimit(clientIp);
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again in a little while." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const { username, repoName, pushedAt } = body || {};

    if (!username || !repoName) {
      return NextResponse.json(
        { error: "Missing required parameters: username and repoName." },
        { status: 400 }
      );
    }

    // Check cache
    const cached = await getPrepCache<ProjectInterviewPrep>(username, repoName, pushedAt || "latest");
    if (cached) {
      return NextResponse.json({ prep: cached, cached: true });
    }

    // Check cached repos first to preserve GitHub rate limits
    const reposCacheKey = `repos:${username.toLowerCase()}`;
    let repos = await getGitHubCache<Awaited<ReturnType<typeof fetchUserRepos>>>(reposCacheKey);

    if (!repos) {
      repos = await fetchUserRepos(username);
      await setGitHubCache(reposCacheKey, repos, 300);
    }
    const repoMeta = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase());

    if (!repoMeta) {
      return NextResponse.json(
        { error: `Repository "${repoName}" not found for user @${username}.` },
        { status: 404 }
      );
    }

    const detail = await fetchRepoDetail(username, repoMeta);
    const context = buildRepoContext(detail);

    const prep = await generateInterviewPrep(context);

    // Save to cache
    await setPrepCache(username, repoName, pushedAt || repoMeta.pushedAt, prep);

    return NextResponse.json({ prep, cached: false });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error occurred.";
    console.error("[Interview Prep API] Error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
