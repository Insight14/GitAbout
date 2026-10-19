import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import {
  fetchUserProfile,
  fetchUserRepos,
  fetchRepoDetail,
} from "@/lib/github/fetchProfile";
import { rankRepos } from "@/lib/ranking/scoreRepos";
import { draftProjectBullets } from "@/lib/llm/draftBullets";
import { getLLMCache, setLLMCache, getGitHubCache, setGitHubCache } from "@/lib/cache";
import {
  ProjectDraft,
  UserNotFoundError,
  RateLimitExceededError,
  GitHubApiError,
  AnalysisResponse,
} from "@/lib/types";

export const maxDuration = 60; // Allow sufficient time for multi-repo analysis

export async function POST(req: NextRequest) {
  try {
    // 1. Per-IP Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateResult = await checkRateLimit(clientIp);
    if (!rateResult.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. You can analyze up to 5 profiles per hour.",
          limit: rateResult.limit,
          remaining: 0,
          reset: rateResult.reset,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((rateResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 2. Validate input
    const body = await req.json().catch(() => null);
    const rawUsername = body?.username;

    if (!rawUsername || typeof rawUsername !== "string" || !rawUsername.trim()) {
      return NextResponse.json(
        { error: "A valid GitHub username is required." },
        { status: 400 }
      );
    }

    // Clean username (e.g. handle if user passed full URL or @)
    let username = rawUsername.trim().replace(/^@/, "");
    if (username.includes("github.com/")) {
      const parts = username.split("github.com/");
      username = parts[1].split("/")[0].trim();
    }
    username = username.replace(/\/.*$/, ""); // strip any trailing slashes or subpaths

    // 3. Fetch User Profile (check short-lived cache first)
    const profileCacheKey = `profile:${username.toLowerCase()}`;
    let profile = await getGitHubCache<AnalysisResponse["profile"]>(profileCacheKey);

    if (!profile) {
      const fetchedProfile = await fetchUserProfile(username);
      profile = {
        name: fetchedProfile.name,
        avatarUrl: fetchedProfile.avatarUrl,
        bio: fetchedProfile.bio,
        publicRepos: fetchedProfile.publicRepos,
        profileUrl: fetchedProfile.profileUrl,
      };
      await setGitHubCache(profileCacheKey, profile, 600); // 10 min cache
    }

    // 4. Fetch User Repos
    const reposCacheKey = `repos:${username.toLowerCase()}`;
    let repos = await getGitHubCache<Awaited<ReturnType<typeof fetchUserRepos>>>(reposCacheKey);

    if (!repos) {
      repos = await fetchUserRepos(username);
      await setGitHubCache(reposCacheKey, repos, 300); // 5 min cache
    }

    if (repos.length === 0) {
      const emptyResponse: AnalysisResponse = {
        username,
        profile,
        projects: [],
        totalAnalyzed: 0,
      };
      return NextResponse.json(emptyResponse);
    }

    // 5. Rank repos heuristically (no LLM)
    const rankedCandidates = rankRepos(repos, 5);

    // 6. Draft bullets for top repos (using cache key: username + repoName + pushedAt)
    const drafts: ProjectDraft[] = [];

    // Process top repos with concurrency
    const projectPromises = rankedCandidates.map(async (candidate) => {
      const { metadata, score } = candidate;

      // Check LLM Cache
      const cachedDraft = await getLLMCache(username, metadata.name, metadata.pushedAt);
      if (cachedDraft) {
        return {
          ...cachedDraft,
          scoreBreakdown: score,
          repoUrl: metadata.url,
          pushedAt: metadata.pushedAt,
        };
      }

      // Fetch repo details (README, manifests, sampled tree, commit messages)
      const detail = await fetchRepoDetail(username, metadata);

      // Draft with Gemini and enforce Zod citations
      const draft = await draftProjectBullets(detail, score);

      // Save to cache
      await setLLMCache(username, metadata.name, metadata.pushedAt, draft);

      return draft;
    });

    const results = await Promise.allSettled(projectPromises);

    for (const r of results) {
      if (r.status === "fulfilled") {
        drafts.push(r.value);
      } else {
        console.error("[Analyze API] Failed to analyze a repository:", r.reason);
      }
    }

    if (drafts.length === 0 && rankedCandidates.length > 0) {
      const firstFailure = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
      const errorMsg =
        firstFailure?.reason instanceof Error
          ? firstFailure.reason.message
          : "Failed to generate project drafts from repositories.";
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    const responsePayload: AnalysisResponse = {
      username,
      profile,
      projects: drafts,
      totalAnalyzed: repos.length,
    };

    return NextResponse.json(responsePayload, {
      headers: {
        "X-RateLimit-Limit": rateResult.limit.toString(),
        "X-RateLimit-Remaining": rateResult.remaining.toString(),
      },
    });
  } catch (err: unknown) {
    if (err instanceof UserNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof RateLimitExceededError) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit reached. Please provide a GITHUB_TOKEN in .env.local to increase the quota to 5,000 requests/hour.",
        },
        { status: 429 }
      );
    }
    if (err instanceof GitHubApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : "Internal server error occurred.";
    console.error("[Analyze API] Unhandled server error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
