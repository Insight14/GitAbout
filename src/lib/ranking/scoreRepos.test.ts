import { describe, it, expect } from "vitest";
import { calculateRepoScore, rankRepos } from "./scoreRepos";
import { RepoMetadata } from "../types";

const mockBaseRepo: RepoMetadata = {
  name: "awesome-project",
  fullName: "octocat/awesome-project",
  description: "A high-performance full-stack web application built with Next.js",
  url: "https://github.com/octocat/awesome-project",
  isFork: false,
  stars: 42,
  forksCount: 5,
  watchersCount: 42,
  openIssuesCount: 2,
  sizeKb: 540,
  primaryLanguage: "TypeScript",
  languages: ["TypeScript"],
  topics: ["nextjs", "react", "typescript"],
  pushedAt: new Date("2026-10-15T12:00:00Z").toISOString(),
  createdAt: new Date("2026-01-01T12:00:00Z").toISOString(),
  defaultBranch: "main",
  hasReadme: true,
};

describe("scoreRepos", () => {
  const referenceNow = new Date("2026-10-19T12:00:00Z");

  it("scores an active, original, starred repo highly", () => {
    const score = calculateRepoScore(mockBaseRepo, referenceNow);
    expect(score.isForkPenalty).toBeGreaterThan(0);
    expect(score.recencyScore).toBe(25); // active within 4 days
    expect(score.starsScore).toBeGreaterThan(15);
    expect(score.totalScore).toBeGreaterThan(60);
  });

  it("penalizes forked repositories heavily", () => {
    const forkedRepo: RepoMetadata = {
      ...mockBaseRepo,
      name: "forked-repo",
      isFork: true,
    };
    const originalScore = calculateRepoScore(mockBaseRepo, referenceNow);
    const forkedScore = calculateRepoScore(forkedRepo, referenceNow);

    expect(forkedScore.isForkPenalty).toBe(-40);
    expect(forkedScore.totalScore).toBeLessThan(originalScore.totalScore);
  });

  it("penalizes tiny or empty repos (<10KB)", () => {
    const tinyRepo: RepoMetadata = {
      ...mockBaseRepo,
      sizeKb: 2,
    };
    const score = calculateRepoScore(tinyRepo, referenceNow);
    expect(score.sizeScore).toBe(-10);
  });

  it("ranks original and active repos ahead of stale or forked repos", () => {
    const staleRepo: RepoMetadata = {
      ...mockBaseRepo,
      name: "old-abandoned-project",
      pushedAt: new Date("2022-01-01T00:00:00Z").toISOString(),
      stars: 1,
    };

    const forkedRepo: RepoMetadata = {
      ...mockBaseRepo,
      name: "forked-upstream",
      isFork: true,
      stars: 1000,
    };

    const ranked = rankRepos([staleRepo, mockBaseRepo, forkedRepo], 5, referenceNow);

    expect(ranked[0].metadata.name).toBe("awesome-project");
    expect(ranked.length).toBe(3);
  });
});
