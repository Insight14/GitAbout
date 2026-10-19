import { RepoMetadata, RepoScoreBreakdown, ScoredRepo } from "../types";

export function calculateRepoScore(repo: RepoMetadata, now: Date = new Date()): RepoScoreBreakdown {
  const reasons: string[] = [];

  // 1. Fork penalty
  let isForkPenalty = 0;
  if (repo.isFork) {
    isForkPenalty = -40;
    reasons.push("Forked repository (-40pts)");
  } else {
    isForkPenalty = 25;
    reasons.push("Original repository (+25pts)");
  }

  // 2. Recency scoring based on pushedAt
  let recencyScore = 0;
  const pushedTime = new Date(repo.pushedAt).getTime();
  const nowTime = now.getTime();
  const daysSincePush = Math.max(0, (nowTime - pushedTime) / (1000 * 60 * 60 * 24));

  if (daysSincePush <= 30) {
    recencyScore = 25;
    reasons.push("Active within last 30 days (+25pts)");
  } else if (daysSincePush <= 90) {
    recencyScore = 18;
    reasons.push("Active within last 3 months (+18pts)");
  } else if (daysSincePush <= 180) {
    recencyScore = 12;
    reasons.push("Active within last 6 months (+12pts)");
  } else if (daysSincePush <= 365) {
    recencyScore = 6;
    reasons.push("Active within last year (+6pts)");
  } else {
    recencyScore = 0;
    reasons.push("Inactive for over 1 year (0pts)");
  }

  // 3. Stars validation
  let starsScore = 0;
  if (repo.stars > 0) {
    starsScore = Math.min(25, Math.round(Math.log2(repo.stars + 1) * 5));
    reasons.push(`${repo.stars} star${repo.stars === 1 ? "" : "s"} (+${starsScore}pts)`);
  }

  // 4. Meaningful size
  let sizeScore = 0;
  if (repo.sizeKb < 10) {
    sizeScore = -10;
    reasons.push("Extremely small repository <10KB (-10pts)");
  } else if (repo.sizeKb >= 50 && repo.sizeKb <= 100000) {
    sizeScore = 15;
    reasons.push("Meaningful codebase size (+15pts)");
  } else {
    sizeScore = 5;
    reasons.push("Acceptable repository size (+5pts)");
  }

  // 5. Documentation & Metadata (Description, Language, Topics)
  let topicsScore = 0;
  if (repo.description && repo.description.trim().length >= 15) {
    topicsScore += 10;
    reasons.push("Has detailed description (+10pts)");
  } else if (repo.description && repo.description.trim().length > 0) {
    topicsScore += 5;
    reasons.push("Has short description (+5pts)");
  }

  if (repo.primaryLanguage) {
    topicsScore += 5;
  }

  const topicBonus = Math.min(10, (repo.topics?.length ?? 0) * 2);
  if (topicBonus > 0) {
    topicsScore += topicBonus;
    reasons.push(`${repo.topics.length} topic tags (+${topicBonus}pts)`);
  }

  // README score placeholder (detail fetch enhances this)
  const readmeScore = repo.hasReadme ? 15 : 0;

  const totalScore =
    isForkPenalty + recencyScore + starsScore + sizeScore + topicsScore + readmeScore;

  return {
    isForkPenalty,
    recencyScore,
    readmeScore,
    starsScore,
    sizeScore,
    topicsScore,
    totalScore,
    reasons,
  };
}

export function rankRepos(
  repos: RepoMetadata[],
  limit: number = 5,
  now: Date = new Date()
): ScoredRepo[] {
  const scored = repos.map((repo) => ({
    metadata: repo,
    score: calculateRepoScore(repo, now),
  }));

  // Sort by totalScore descending
  scored.sort((a, b) => b.score.totalScore - a.score.totalScore);

  return scored.slice(0, limit);
}
