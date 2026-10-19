import { getOctokit } from "./client";
import {
  RepoMetadata,
  RepoDetail,
  ManifestFile,
  UserNotFoundError,
  RateLimitExceededError,
  GitHubApiError,
} from "../types";

export interface UserProfileData {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  profileUrl: string;
}

const MANIFEST_CANDIDATES = [
  "package.json",
  "requirements.txt",
  "pyproject.toml",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "Gemfile",
  "composer.json",
  "Dockerfile",
];

export async function fetchUserProfile(username: string): Promise<UserProfileData> {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    return {
      username: data.login,
      name: data.name ?? null,
      avatarUrl: data.avatar_url,
      bio: data.bio ?? null,
      publicRepos: data.public_repos,
      profileUrl: data.html_url,
    };
  } catch (err: unknown) {
    handleGitHubError(err, username);
  }
}

export async function fetchUserRepos(username: string): Promise<RepoMetadata[]> {
  const octokit = getOctokit();
  try {
    const { data } = await octokit.rest.repos.listForUser({
      username,
      type: "owner",
      sort: "pushed",
      direction: "desc",
      per_page: 50,
    });

    return data.map((repo) => ({
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      isFork: Boolean(repo.fork),
      stars: repo.stargazers_count ?? 0,
      forksCount: repo.forks_count ?? 0,
      watchersCount: repo.watchers_count ?? 0,
      openIssuesCount: repo.open_issues_count ?? 0,
      sizeKb: repo.size ?? 0,
      primaryLanguage: repo.language ?? null,
      languages: repo.language ? [repo.language] : [],
      topics: repo.topics ?? [],
      pushedAt: repo.pushed_at ?? new Date(0).toISOString(),
      createdAt: repo.created_at ?? new Date(0).toISOString(),
      defaultBranch: repo.default_branch ?? "main",
      hasReadme: false, // will be verified during detail fetch
    }));
  } catch (err: unknown) {
    handleGitHubError(err, username);
  }
}

export async function fetchRepoDetail(
  owner: string,
  repoMeta: RepoMetadata
): Promise<RepoDetail> {
  const octokit = getOctokit();
  const repo = repoMeta.name;

  // 1. Fetch README
  let readmeSnippet = "";
  try {
    const { data: readmeData } = await octokit.rest.repos.getReadme({
      owner,
      repo,
    });
    if ("content" in readmeData && typeof readmeData.content === "string") {
      const decoded = Buffer.from(readmeData.content, "base64").toString("utf-8");
      readmeSnippet = decoded.slice(0, 4000); // Truncate early
    }
  } catch {
    // README missing or 404, gracefully handled
  }

  // 2. Fetch sampled tree (top 2 levels)
  const fileTreeSample: string[] = [];
  const foundManifests: string[] = [];
  try {
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: repoMeta.defaultBranch,
      recursive: "1",
    });

    if (treeData.tree && Array.isArray(treeData.tree)) {
      for (const item of treeData.tree) {
        if (!item.path) continue;
        const depth = item.path.split("/").length;
        if (depth <= 2) {
          fileTreeSample.push(item.path);
        }
        const basename = item.path.split("/").pop() ?? "";
        if (MANIFEST_CANDIDATES.includes(basename) && !foundManifests.includes(item.path)) {
          foundManifests.push(item.path);
        }
      }
    }
  } catch {
    // Empty repo or tree error, fallback
  }

  // 3. Fetch manifest contents (up to 3 manifests max to preserve rate limits)
  const manifests: ManifestFile[] = [];
  const manifestsToFetch = foundManifests.slice(0, 3);
  for (const manifestPath of manifestsToFetch) {
    try {
      const { data: fileData } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: manifestPath,
      });

      if ("content" in fileData && typeof fileData.content === "string") {
        const decoded = Buffer.from(fileData.content, "base64").toString("utf-8");
        // Keep first 200 lines max
        const truncated = decoded.split("\n").slice(0, 200).join("\n");
        manifests.push({
          filename: manifestPath,
          content: truncated,
        });
      }
    } catch {
      // Ignore individual manifest read errors
    }
  }

  // 4. Fetch last ~20 commit messages
  const recentCommitMessages: string[] = [];
  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 20,
    });
    for (const c of commits) {
      const firstLine = c.commit.message.split("\n")[0].trim();
      if (firstLine) {
        recentCommitMessages.push(firstLine);
      }
    }
  } catch {
    // Commits fetch failure handled gracefully
  }

  return {
    ...repoMeta,
    hasReadme: readmeSnippet.trim().length > 0,
    readmeSnippet,
    manifests,
    fileTreeSample: fileTreeSample.slice(0, 40),
    recentCommitMessages,
  };
}

function handleGitHubError(err: unknown, identifier: string): never {
  if (err && typeof err === "object" && "status" in err) {
    const status = Number((err as { status: unknown }).status);
    if (status === 404) {
      throw new UserNotFoundError(identifier);
    }
    if (status === 403 || status === 429) {
      throw new RateLimitExceededError();
    }
    const message =
      "message" in err && typeof err.message === "string"
        ? err.message
        : "GitHub API request failed";
    throw new GitHubApiError(message, status);
  }

  throw new GitHubApiError(
    err instanceof Error ? err.message : "Unknown error while calling GitHub API",
    500
  );
}
