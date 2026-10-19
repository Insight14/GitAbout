import { GoogleGenAI, Type } from "@google/genai";
import { INTERVIEW_PREP_SYSTEM_PROMPT } from "./prompts";
import {
  ProjectInterviewPrepSchema,
  ValidatedInterviewPrep,
} from "./schemas";
import { CondensedRepoContext, ProjectInterviewPrep, WeakSpotFlag } from "../types";
import { getGeminiModelName } from "./gemini";

let genAIClient: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured.");
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

const interviewPrepResponseSchema = {
  type: Type.OBJECT,
  properties: {
    repo: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: [
              "architecture",
              "tradeoffs",
              "challenge",
              "testing",
              "scaling",
              "improvements",
            ],
          },
          talkingPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING },
                evidence: { type: Type.STRING },
              },
              required: ["point", "evidence"],
            },
          },
          isRepoSilent: { type: Type.BOOLEAN },
          suggestedAnswerStrategy: { type: Type.STRING },
        },
        required: [
          "question",
          "category",
          "talkingPoints",
          "isRepoSilent",
          "suggestedAnswerStrategy",
        ],
      },
    },
    weakSpots: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING },
          description: { type: Type.STRING },
          rehearsalTip: { type: Type.STRING },
        },
        required: ["area", "description", "rehearsalTip"],
      },
    },
  },
  required: ["repo", "questions", "weakSpots"],
};

export async function generateInterviewPrep(
  context: CondensedRepoContext
): Promise<ProjectInterviewPrep> {
  const client = getClient();
  const modelName = getGeminiModelName();

  const userPrompt = `Generate a rigorous technical interview Q&A prep package for the repository "${context.name}".
Context:
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Requirements:
1. Provide at least 1 question for each category: architecture, tradeoffs, challenge, testing, scaling, improvements.
2. Ensure talking points cite exact files or commits.
3. If an aspect (like production scale or users) is missing from the repo, set isRepoSilent: true with a suggestedAnswerStrategy.
4. Flag honest weak spots (e.g. no tests, unhandled errors, sparse docs) with practical rehearsal tips.`;

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [userPrompt],
      config: {
        systemInstruction: INTERVIEW_PREP_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: interviewPrepResponseSchema,
        temperature: 0.2,
      },
    });

    const rawText = response.text || "";
    const parsed = JSON.parse(rawText);
    const validated = ProjectInterviewPrepSchema.safeParse(parsed);

    if (validated.success) {
      return {
        ...validated.data,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn(`[InterviewPrep] LLM call failed for "${context.name}", applying deterministic analyzer:`, err);
  }

  // Resilient deterministic fallback
  return createInterviewPrepFallback(context);
}

export function detectWeakSpots(context: CondensedRepoContext): WeakSpotFlag[] {
  const flags: WeakSpotFlag[] = [];

  // Check for test files
  const hasTests = context.directoryStructure.some((path) => {
    const lower = path.toLowerCase();
    return (
      lower.includes("test") ||
      lower.includes("spec") ||
      lower.includes("__tests__") ||
      lower.endsWith(".test.ts") ||
      lower.endsWith(".test.js") ||
      lower.endsWith(".test.py") ||
      lower.endsWith("_test.go")
    );
  });

  if (!hasTests) {
    flags.push({
      area: "Automated Test Suite",
      description: "No unit or integration test files detected in the sampled repository structure.",
      rehearsalTip:
        "Proactively address this in interviews: 'While the initial focus was rapid implementation of the core features, in a production release my immediate next step would be establishing a comprehensive test suite (unit + integration tests) to ensure reliability.'",
    });
  }

  // Check README quality
  if (!context.readmeExcerpt || context.readmeExcerpt.length < 150) {
    flags.push({
      area: "Documentation & Architecture Specification",
      description: "The README is minimal or lacks comprehensive setup and architecture diagrams.",
      rehearsalTip:
        "Explain your workflow: 'The repository represents an agile MVP; for team handoffs I prioritize creating detailed architectural flowcharts, environment setup guides, and OpenAPI schemas.'",
    });
  }

  // Check for configuration / environment management
  const hasEnvExample = context.directoryStructure.some((p) => p.includes(".env.example"));
  if (!hasEnvExample) {
    flags.push({
      area: "Environment Variable & Config Management",
      description: "No .env.example or centralized config template detected.",
      rehearsalTip:
        "Highlight your security mindset: 'I ensure secrets are excluded via .gitignore, and in a production deployment pipeline I manage secrets strictly through AWS Secrets Manager or Vault rather than local files.'",
    });
  }

  return flags;
}

export function createInterviewPrepFallback(context: CondensedRepoContext): ProjectInterviewPrep {
  const weakSpots = detectWeakSpots(context);
  const primaryLang = context.primaryLanguage || "TypeScript";
  const recentCommit = context.recentCommits[0] || "core feature implementation";

  const questions = [
    {
      question: `Can you walk me through the high-level architecture of ${context.name} and how data flows through it?`,
      category: "architecture" as const,
      talkingPoints: [
        {
          point: `Engineered core application logic utilizing ${primaryLang} with modular directory structure`,
          evidence: `primaryLanguage: ${primaryLang}`,
        },
        {
          point: `Key dependencies and modules: ${context.keyDependencies.slice(0, 3).join("; ") || "standard library components"}`,
          evidence: context.keyDependencies[0] || "manifests",
        },
      ],
      isRepoSilent: false,
      suggestedAnswerStrategy:
        "Start with the primary problem the repo solves, outline the major components, and trace an incoming request from start to finish.",
    },
    {
      question: `Why did you select ${primaryLang} and its core dependencies for this project over competing alternatives?`,
      category: "tradeoffs" as const,
      talkingPoints: [
        {
          point: `Evaluated ${primaryLang} for development velocity, ecosystem libraries, and type safety/runtime performance`,
          evidence: `package/manifest configuration`,
        },
      ],
      isRepoSilent: true,
      suggestedAnswerStrategy:
        "Acknowledge what alternative tools you considered, and explain the specific tradeoffs (e.g. developer speed vs raw execution speed, library ecosystem maturity).",
    },
    {
      question: `What was the most challenging technical roadblock or bug you encountered during development?`,
      category: "challenge" as const,
      talkingPoints: [
        {
          point: `Resolved edge case or feature challenge reflected in commit: "${recentCommit}"`,
          evidence: `commit: ${recentCommit}`,
        },
      ],
      isRepoSilent: true,
      suggestedAnswerStrategy:
        "Frame using the STAR method: Situation (the bottleneck), Task (the objective), Action (debugging tools and methodology used), and Result (the fix and how you prevented regressions).",
    },
    {
      question: `How did you verify correctness and test that your code handles edge cases gracefully?`,
      category: "testing" as const,
      talkingPoints: [
        {
          point: `Manual validation and iterative commit milestones: "${recentCommit}"`,
          evidence: `commit: ${recentCommit}`,
        },
      ],
      isRepoSilent: true,
      suggestedAnswerStrategy:
        weakSpots.some((w) => w.area.includes("Test"))
          ? "Be honest: explain how you validated it locally, and explicitly outline what test coverage you would build next (unit tests, mocks, CI pipeline)."
          : "Detail your testing pyramid: unit tests for business logic, integration tests for APIs, and end-to-end user journeys.",
    },
    {
      question: `If traffic to ${context.name} increased by 100x overnight, where would the system break first, and how would you scale it?`,
      category: "scaling" as const,
      talkingPoints: [
        {
          point: `Identified potential compute and I/O bottlenecks in the data pipeline`,
          evidence: `codebase structure and language runtime`,
        },
      ],
      isRepoSilent: true,
      suggestedAnswerStrategy:
        "Walk through layers: database connection pooling, redis caching layer, stateless worker horizontal scaling, and asynchronous background queues.",
    },
    {
      question: `Looking back, what is one major architectural decision in ${context.name} you would change if starting over today?`,
      category: "improvements" as const,
      talkingPoints: [
        {
          point: `Evolving from early MVP abstractions to production-grade decoupling and strict schema validation`,
          evidence: `commit history and directory evolution`,
        },
      ],
      isRepoSilent: false,
      suggestedAnswerStrategy:
        "Demonstrate technical maturity by showing that your architectural thinking has grown since writing the original prototype.",
    },
  ];

  return {
    repo: context.name,
    questions,
    weakSpots,
    generatedAt: new Date().toISOString(),
  };
}
