import { buildRepoContext } from "../context/buildRepoContext";
import { generateProjectDraft } from "./gemini";
import { ProjectDraft, RepoDetail, RepoScoreBreakdown } from "../types";

export async function draftProjectBullets(
  repoDetail: RepoDetail,
  scoreBreakdown?: RepoScoreBreakdown
): Promise<ProjectDraft> {
  const context = buildRepoContext(repoDetail);
  const validatedDraft = await generateProjectDraft(context);

  return {
    ...validatedDraft,
    scoreBreakdown,
    repoUrl: repoDetail.url,
    pushedAt: repoDetail.pushedAt,
  };
}
