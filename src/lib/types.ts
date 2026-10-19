export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  isFork: boolean;
  stars: number;
  forksCount: number;
  watchersCount: number;
  openIssuesCount: number;
  sizeKb: number;
  primaryLanguage: string | null;
  languages: string[];
  topics: string[];
  pushedAt: string;
  createdAt: string;
  defaultBranch: string;
  hasReadme: boolean;
}

export interface RepoScoreBreakdown {
  isForkPenalty: number;
  recencyScore: number;
  readmeScore: number;
  starsScore: number;
  sizeScore: number;
  topicsScore: number;
  totalScore: number;
  reasons: string[];
}

export interface ScoredRepo {
  metadata: RepoMetadata;
  score: RepoScoreBreakdown;
}

export interface ManifestFile {
  filename: string;
  content: string;
}

export interface RepoDetail extends RepoMetadata {
  readmeSnippet?: string;
  manifests: ManifestFile[];
  fileTreeSample: string[];
  recentCommitMessages: string[];
}

export interface CondensedRepoContext {
  name: string;
  description: string;
  primaryLanguage: string;
  languages: string[];
  topics: string[];
  stars: number;
  lastUpdated: string;
  readmeExcerpt: string;
  keyDependencies: string[];
  directoryStructure: string[];
  recentCommits: string[];
}

export interface BulletPoint {
  text: string;
  source: string;
  confidence: "high" | "medium" | "low";
}

export interface SkillEvidence {
  name: string;
  evidence: string;
}

export interface ProjectDraft {
  repo: string;
  summary: string;
  bullets: BulletPoint[];
  skills: SkillEvidence[];
  missing_info: string[];
  scoreBreakdown?: RepoScoreBreakdown;
  repoUrl: string;
  pushedAt: string;
}

export interface AnalysisResponse {
  username: string;
  profile: {
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    publicRepos: number;
    profileUrl: string;
  };
  projects: ProjectDraft[];
  totalAnalyzed: number;
  cachedAt?: string;
}

export class GitHubApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "GitHubApiError";
  }
}

export class UserNotFoundError extends GitHubApiError {
  constructor(username: string) {
    super(`GitHub user "${username}" was not found.`, 404);
    this.name = "UserNotFoundError";
  }
}

export class RateLimitExceededError extends GitHubApiError {
  constructor(message: string = "GitHub API rate limit exceeded.") {
    super(message, 429);
    this.name = "RateLimitExceededError";
  }
}
