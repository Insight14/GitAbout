import { z } from "zod";

export const BulletPointSchema = z.object({
  text: z.string().min(5, "Bullet text must be at least 5 characters"),
  source: z.string().min(1, "Source citation is required and must not be empty"),
  confidence: z.enum(["high", "medium", "low"]),
});

export const SkillEvidenceSchema = z.object({
  name: z.string().min(1, "Skill name cannot be empty"),
  evidence: z.string().min(1, "Evidence proving skill is required"),
});

export const ProjectDraftSchema = z.object({
  repo: z.string().min(1),
  summary: z.string().min(5, "Summary must be at least 5 characters grounded in README"),
  bullets: z.array(BulletPointSchema).min(1, "At least 1 bullet is required"),
  skills: z.array(SkillEvidenceSchema),
  missing_info: z.array(z.string()),
});

export type ValidatedProjectDraft = z.infer<typeof ProjectDraftSchema>;

export const QuestionCategorySchema = z.enum([
  "architecture",
  "tradeoffs",
  "challenge",
  "testing",
  "scaling",
  "improvements",
]);

export const InterviewQuestionSchema = z.object({
  question: z.string().min(5),
  category: QuestionCategorySchema,
  talkingPoints: z.array(
    z.object({
      point: z.string().min(3),
      evidence: z.string().min(1),
    })
  ),
  isRepoSilent: z.boolean(),
  suggestedAnswerStrategy: z.string().min(3),
});

export const WeakSpotFlagSchema = z.object({
  area: z.string().min(2),
  description: z.string().min(5),
  rehearsalTip: z.string().min(5),
});

export const ProjectInterviewPrepSchema = z.object({
  repo: z.string().min(1),
  questions: z.array(InterviewQuestionSchema),
  weakSpots: z.array(WeakSpotFlagSchema),
  generatedAt: z.string().optional(),
});

export type ValidatedInterviewPrep = z.infer<typeof ProjectInterviewPrepSchema>;

// Phase 3 Schemas
export const SkillMatchSchema = z.object({
  skill: z.string().min(1),
  status: z.enum(["matched", "missing", "adjacent"]),
  matchedRepo: z.string().optional(),
  evidence: z.string().optional(),
  notes: z.string().optional(),
});

export const HighlightedBulletSchema = z.object({
  text: z.string().min(5),
  source: z.string().min(1),
  confidence: z.enum(["high", "medium", "low"]),
  isDirectMatch: z.boolean(),
});

export const TailoredProjectSchema = z.object({
  repo: z.string().min(1),
  relevanceScore: z.number().min(0).max(100),
  relevanceReason: z.string().min(5),
  matchedSkills: z.array(z.string()),
  highlightedBullets: z.array(HighlightedBulletSchema),
});

export const GapTalkingPointSchema = z.object({
  missingSkill: z.string().min(1),
  recommendation: z.string().min(5),
});

export const JobTailoringResponseSchema = z.object({
  jobTitle: z.string().min(1),
  company: z.string().optional(),
  matchScore: z.number().min(0).max(100),
  overallSummary: z.string().min(10),
  matchedSkills: z.array(SkillMatchSchema),
  missingSkills: z.array(SkillMatchSchema),
  tailoredProjects: z.array(TailoredProjectSchema),
  interviewTalkingPointsForGaps: z.array(GapTalkingPointSchema),
});

export type ValidatedJobTailoring = z.infer<typeof JobTailoringResponseSchema>;

export interface ValidationResult {
  valid: boolean;
  data?: ValidatedProjectDraft;
  hasMissingSource: boolean;
  errors: string[];
}

export function validateProjectDraftResponse(raw: unknown): ValidationResult {
  const result = ProjectDraftSchema.safeParse(raw);

  if (result.success) {
    const invalidBullets = result.data.bullets.filter(
      (b) => !b.source || b.source.trim().length === 0
    );
    if (invalidBullets.length > 0) {
      return {
        valid: false,
        hasMissingSource: true,
        errors: [`${invalidBullets.length} bullet(s) lacked a non-empty source citation`],
      };
    }
    return {
      valid: true,
      data: result.data,
      hasMissingSource: false,
      errors: [],
    };
  }

  const hasMissingSource = result.error.issues.some((issue) =>
    issue.path.includes("source")
  );

  return {
    valid: false,
    hasMissingSource,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}

export function dropInvalidBullets(bullets: unknown[]): z.infer<typeof BulletPointSchema>[] {
  if (!Array.isArray(bullets)) return [];
  const valid: z.infer<typeof BulletPointSchema>[] = [];

  for (const b of bullets) {
    const parse = BulletPointSchema.safeParse(b);
    if (parse.success && parse.data.source.trim().length > 0) {
      valid.push(parse.data);
    }
  }

  return valid;
}
