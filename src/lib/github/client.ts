import { Octokit } from "octokit";

let cachedClient: Octokit | null = null;

export function getOctokit(): Octokit {
  if (cachedClient) {
    return cachedClient;
  }

  const token = process.env.GITHUB_TOKEN?.trim();

  if (process.env.NODE_ENV === "development") {
    if (token) {
      console.log("[GitHub] Octokit initialized with GITHUB_TOKEN (authenticated quota).");
    } else {
      console.warn(
        "[GitHub] Octokit initialized WITHOUT GITHUB_TOKEN (60 requests/hr quota). Set GITHUB_TOKEN in .env.local for higher limits."
      );
    }
  }

  cachedClient = new Octokit({
    auth: token || undefined,
    throttle: {
      onRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`[GitHub] Rate limit hit for ${options.method} ${options.url}. Retry after ${retryAfter}s`);
        return false; // Do not hang or block, return 429
      },
      onSecondaryRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`[GitHub] Secondary rate limit hit for ${options.method} ${options.url}. Retry after ${retryAfter}s`);
        return false;
      },
    },
  });

  return cachedClient;
}
