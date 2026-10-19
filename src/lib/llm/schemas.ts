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

export interface ValidationResult {
  valid: boolean;
  data?: ValidatedProjectDraft;
  hasMissingSource: boolean;
  errors: string[];
}

export function validateProjectDraftResponse(raw: unknown): ValidationResult {
  const result = ProjectDraftSchema.safeParse(raw);

  if (result.success) {
    // Check if any bullet has empty or whitespace-only source
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

  // Inspect Zod issue paths to see if 'source' was missing
  const hasMissingSource = result.error.issues.some((issue) =>
    issue.path.includes("source")
  );

  return {
    valid: false,
    hasMissingSource,
    errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
  };
}

/**
 * Filter out any invalid bullets as a final fallback after retry
 */
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
