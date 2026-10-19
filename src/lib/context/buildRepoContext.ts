import { CondensedRepoContext, RepoDetail } from "../types";

export function extractDependencies(
  filename: string,
  content: string
): string[] {
  const deps: string[] = [];
  const basename = filename.split("/").pop() ?? "";

  try {
    if (basename === "package.json") {
      const parsed = JSON.parse(content);
      const prodDeps = Object.keys(parsed.dependencies || {});
      const devDeps = Object.keys(parsed.devDependencies || {});
      deps.push(...prodDeps.map((d) => `${d} (prod)`));
      deps.push(...devDeps.slice(0, 10).map((d) => `${d} (dev)`));
    } else if (basename === "requirements.txt") {
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("-")) {
          deps.push(trimmed.split("==")[0].split(">=")[0].trim());
        }
      }
    } else if (basename === "Cargo.toml") {
      const lines = content.split("\n");
      let inDeps = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("[dependencies]")) {
          inDeps = true;
          continue;
        } else if (trimmed.startsWith("[")) {
          inDeps = false;
        }
        if (inDeps && trimmed && !trimmed.startsWith("#")) {
          deps.push(trimmed.split("=")[0].trim());
        }
      }
    } else if (basename === "go.mod") {
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("require ") || (trimmed && !trimmed.startsWith("module") && !trimmed.startsWith("go "))) {
          const mod = trimmed.replace("require ", "").split(" ")[0];
          if (mod && !mod.includes(")")) deps.push(mod);
        }
      }
    }
  } catch {
    // If manifest parsing fails, fall back gracefully
  }

  return deps.slice(0, 25);
}

function cleanReadme(readme: string): string {
  if (!readme) return "No README provided.";

  // Strip badges, image markdown tags, html comments
  const cleaned = readme
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Max 2,000 characters (~500 tokens)
  if (cleaned.length > 2000) {
    return cleaned.slice(0, 2000) + "\n...[truncated]";
  }
  return cleaned;
}

export function buildRepoContext(repo: RepoDetail): CondensedRepoContext {
  const allDeps: string[] = [];
  for (const manifest of repo.manifests) {
    const deps = extractDependencies(manifest.filename, manifest.content);
    if (deps.length > 0) {
      allDeps.push(`${manifest.filename}: [${deps.slice(0, 15).join(", ")}]`);
    }
  }

  const context: CondensedRepoContext = {
    name: repo.name,
    description: repo.description ?? "None provided",
    primaryLanguage: repo.primaryLanguage ?? "Unknown",
    languages: repo.languages,
    topics: repo.topics,
    stars: repo.stars,
    lastUpdated: repo.pushedAt,
    readmeExcerpt: cleanReadme(repo.readmeSnippet || ""),
    keyDependencies: allDeps,
    directoryStructure: repo.fileTreeSample.slice(0, 30),
    recentCommits: repo.recentCommitMessages.slice(0, 15),
  };

  if (process.env.NODE_ENV === "development") {
    const jsonStr = JSON.stringify(context);
    const approxTokens = Math.ceil(jsonStr.length / 4);
    console.log(
      `[ContextBuilder] Repo "${repo.name}": ~${approxTokens} tokens (${jsonStr.length} chars)`
    );
  }

  return context;
}
