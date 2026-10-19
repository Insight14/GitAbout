import { NextRequest } from "next/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { checkRateLimit } from "@/lib/rateLimit";
import { fetchUserRepos, fetchRepoDetail } from "@/lib/github/fetchProfile";
import { buildRepoContext } from "@/lib/context/buildRepoContext";
import { INTERVIEW_PREP_SYSTEM_PROMPT } from "@/lib/llm/prompts";
import { getGeminiModelName } from "@/lib/llm/gemini";

import { getGitHubCache, setGitHubCache } from "@/lib/cache";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    const rateResult = await checkRateLimit(clientIp);
    if (!rateResult.success) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const { username, repoName } = body || {};

    if (!username || !repoName) {
      return new Response(JSON.stringify({ error: "Missing username or repoName." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const reposCacheKey = `repos:${username.toLowerCase()}`;
    let repos = await getGitHubCache<Awaited<ReturnType<typeof fetchUserRepos>>>(reposCacheKey);

    if (!repos) {
      repos = await fetchUserRepos(username);
      await setGitHubCache(reposCacheKey, repos, 300);
    }
    const repoMeta = repos.find((r) => r.name.toLowerCase() === repoName.toLowerCase());

    if (!repoMeta) {
      return new Response(JSON.stringify({ error: "Repository not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const detail = await fetchRepoDetail(username, repoMeta);
    const context = buildRepoContext(detail);

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const google = createGoogleGenerativeAI({ apiKey });
    const modelName = getGeminiModelName();

    try {
      const result = streamText({
        model: google(modelName),
        system: INTERVIEW_PREP_SYSTEM_PROMPT,
        prompt: `Generate an in-depth technical interview prep guide for repository "${repoName}".
Ground all questions in the following context:
${JSON.stringify(context, null, 2)}

Provide realistic questions for:
1. Architecture & Design
2. Tradeoffs & Decisions
3. Hardest Challenges
4. Testing & Verification
5. Scaling & Performance
6. "What would you change?"
Highlight evidence for talking points, note where the repo is silent, and flag honest weak spots with constructive rehearsal tips.`,
      });

      return result.toTextStreamResponse();
    } catch (streamErr) {
      console.warn("[Stream Prep API] Google stream unavailable, streaming fallback:", streamErr);
      return streamFallbackResponse(context);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Streaming failed.";
    console.error("[Stream Prep API] Error:", err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

function streamFallbackResponse(context: any): Response {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      const fallbackText = `### Technical Interview Coaching: ${context.name}

#### 1. Architecture & Core Data Flow
- **Primary Language:** ${context.primaryLanguage}
- **System Structure:** Walk the interviewer through the high-level architecture starting from incoming inputs down to data transformations.
- **Evidence:** Citing repository language (${context.primaryLanguage}) and core files.

#### 2. Technical Decisions & Tradeoffs
- **Tooling Choice:** Discuss why you chose ${context.primaryLanguage} over alternatives.
- **Tradeoff Strategy:** Emphasize development velocity, strong typing/libraries, and prototyping speed.

#### 3. Hardest Engineering Challenge
- **Key Breakthrough:** Focus on recent improvements such as "${context.recentCommits[0] || "core module implementation"}".
- **STAR Method:** Explain the technical roadblock, the diagnostic tools you used, and how you validated the resolution.

#### 4. Testing & Correctness (Weak Spot Alert)
- **Honest Assessment:** If no automated test suites are in the repo, explain: "My initial focus was building the core engine; in a team production release, my immediate priority would be architecting unit and integration test fixtures."

#### 5. Scaling & Performance (100x Growth)
- **Bottlenecks:** Discuss where compute or I/O latency would spike first.
- **Mitigation:** Introduce caching (Redis), asynchronous queues, and horizontal worker scaling.

#### 6. What Would You Change?
- **Reflection:** Discuss evolving early architectural abstractions into strictly typed interfaces.
`;

      let offset = 0;
      const chunkSize = 20;

      function push() {
        if (offset < fallbackText.length) {
          const chunk = fallbackText.slice(offset, offset + chunkSize);
          controller.enqueue(encoder.encode(chunk));
          offset += chunkSize;
          setTimeout(push, 25);
        } else {
          controller.close();
        }
      }

      push();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
