import { describe, it, expect } from "vitest";
import {
  validateProjectDraftResponse,
  dropInvalidBullets,
  ProjectDraftSchema,
} from "./schemas";

describe("schemas validation & source enforcement", () => {
  const validDraft = {
    repo: "awesome-next-app",
    summary: "A Next.js full-stack application featuring server actions and Tailwind CSS.",
    bullets: [
      {
        text: "Architected modular REST and GraphQL endpoints handling user authentication and state synchronization",
        source: "package.json: @octokit/rest",
        confidence: "high" as const,
      },
      {
        text: "Configured automated CI pipeline for linting, type-checking, and test suite execution",
        source: "file: .github/workflows/ci.yml",
        confidence: "medium" as const,
      },
    ],
    skills: [
      { name: "TypeScript", evidence: "tsconfig.json" },
      { name: "Next.js", evidence: "package.json: next" },
    ],
    missing_info: [
      "What were the peak active user counts or concurrent request volumes?",
      "Were there measurable latency improvements after switching to server actions?",
    ],
  };

  it("successfully validates a compliant draft with valid citations", () => {
    const res = validateProjectDraftResponse(validDraft);
    expect(res.valid).toBe(true);
    expect(res.data?.bullets.length).toBe(2);
    expect(res.hasMissingSource).toBe(false);
  });

  it("detects when a bullet is missing a source and flags hasMissingSource", () => {
    const invalidDraft = {
      ...validDraft,
      bullets: [
        {
          text: "Scaled backend to handle 50,000 queries per second with sub-5ms latency",
          source: "", // empty source!
          confidence: "high",
        },
      ],
    };

    const res = validateProjectDraftResponse(invalidDraft);
    expect(res.valid).toBe(false);
    expect(res.hasMissingSource).toBe(true);
  });

  it("drops invalid bullets that lack source citation while keeping valid ones", () => {
    const mixedBullets = [
      {
        text: "Designed responsive UI components using Tailwind CSS utility classes",
        source: "tailwind.config.ts",
        confidence: "high",
      },
      {
        text: "Invented imaginary metric with no citation",
        source: "",
        confidence: "low",
      },
      {
        text: "Missing source property entirely",
        confidence: "medium",
      },
      {
        text: "Fix",
        source: "README.md",
        confidence: "high",
      },
    ];

    const sanitized = dropInvalidBullets(mixedBullets);
    expect(sanitized.length).toBe(1);
    expect(sanitized[0].source).toBe("tailwind.config.ts");
  });

  it("enforces schema types with strict zod parse", () => {
    expect(() =>
      ProjectDraftSchema.parse({
        repo: "incomplete",
        summary: "test",
        bullets: [],
        skills: [],
        missing_info: [],
      })
    ).toThrow();
  });
});
