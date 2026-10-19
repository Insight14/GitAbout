import { GoogleGenAI, Type } from "@google/genai";
import { RESUME_DRAFT_SYSTEM_PROMPT, CORRECTIVE_RETRY_PROMPT } from "./prompts";
import {
  validateProjectDraftResponse,
  dropInvalidBullets,
  ValidatedProjectDraft,
} from "./schemas";
import { CondensedRepoContext, ProjectDraft } from "../types";

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not configured. Please add it to your .env.local file."
    );
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

export function getGeminiModelName(): string {
  const model = process.env.GEMINI_MODEL?.trim();
  if (!model) {
    return "gemini-3.5-flash";
  }
  return model;
}

const geminiResponseSchema = {
  type: Type.OBJECT,
  properties: {
    repo: { type: Type.STRING },
    summary: { type: Type.STRING },
    bullets: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          source: { type: Type.STRING },
          confidence: {
            type: Type.STRING,
            enum: ["high", "medium", "low"],
          },
        },
        required: ["text", "source", "confidence"],
      },
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          evidence: { type: Type.STRING },
        },
        required: ["name", "evidence"],
      },
    },
    missing_info: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["repo", "summary", "bullets", "skills", "missing_info"],
};

export async function generateProjectDraft(
  context: CondensedRepoContext
): Promise<ValidatedProjectDraft> {
  const client = getGeminiClient();
  const modelName = getGeminiModelName();

  const userPrompt = `Here is the condensed repository context for repository "${context.name}":
\`\`\`json
${JSON.stringify(context, null, 2)}
\`\`\`

Generate 2-3 evidence-backed resume bullets, identified technical skills with citations, and missing impact questions. Output valid JSON strictly conforming to the schema.`;

  // First Attempt
  let rawText = "";
  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents: [userPrompt],
      config: {
        systemInstruction: RESUME_DRAFT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
        temperature: 0.2, // low temperature for high fidelity / facts
      },
    });

    rawText = response.text || "";
  } catch (err: unknown) {
    console.warn(`[Gemini] Generation call error for "${context.name}":`, err);
    // If Gemini is unavailable, return safe evidence-grounded metadata draft
    return createConservativeFallback(context);
  }

  // Parse and validate first attempt
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = null;
  }

  const validation = validateProjectDraftResponse(parsed);

  if (validation.valid && validation.data) {
    return validation.data;
  }

  // Corrective Retry: 1 attempt with corrective feedback if missing source or schema violation
  console.warn(
    `[Gemini] Initial draft validation failed for "${context.name}". Retrying with corrective prompt. Errors:`,
    validation.errors
  );

  try {
    const retryResponse = await client.models.generateContent({
      model: modelName,
      contents: [
        userPrompt,
        `Assistant response: ${rawText}`,
        `${CORRECTIVE_RETRY_PROMPT}\nSpecific validation issues:\n${validation.errors.join("\n")}`,
      ],
      config: {
        systemInstruction: RESUME_DRAFT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: geminiResponseSchema,
        temperature: 0.1,
      },
    });

    const retryText = retryResponse.text || "";
    const retryParsed = JSON.parse(retryText);
    const retryValidation = validateProjectDraftResponse(retryParsed);

    if (retryValidation.valid && retryValidation.data) {
      return retryValidation.data;
    }

    // If retry still had issues, drop invalid bullets that lack source
    if (retryParsed && typeof retryParsed === "object" && "bullets" in retryParsed) {
      const sanitizedBullets = dropInvalidBullets((retryParsed as { bullets: unknown[] }).bullets);
      if (sanitizedBullets.length > 0) {
        return {
          repo: context.name,
          summary:
            typeof (retryParsed as { summary?: unknown }).summary === "string"
              ? (retryParsed as { summary: string }).summary
              : context.description,
          bullets: sanitizedBullets,
          skills: Array.isArray((retryParsed as { skills?: unknown[] }).skills)
            ? ((retryParsed as { skills: { name: string; evidence: string }[] }).skills)
            : [],
          missing_info: Array.isArray((retryParsed as { missing_info?: unknown[] }).missing_info)
            ? ((retryParsed as { missing_info: string[] }).missing_info)
            : ["What were the primary performance metrics or scale achieved?"],
        };
      }
    }
  } catch (retryErr) {
    console.error("[Gemini] Corrective retry encountered error:", retryErr);
  }

  // Final fallback if bullets were dropped
  if (parsed && typeof parsed === "object" && "bullets" in parsed) {
    const sanitized = dropInvalidBullets((parsed as { bullets: unknown[] }).bullets);
    if (sanitized.length > 0) {
      return {
        repo: context.name,
        summary: context.description || `Software project built with ${context.primaryLanguage}`,
        bullets: sanitized,
        skills: [{ name: context.primaryLanguage, evidence: "primaryLanguage" }],
        missing_info: ["What metrics or quantifiable results were achieved?"],
      };
    }
  }

  // Absolute fallback: 1 conservative bullet derived from verified repository metadata
  return createConservativeFallback(context);
}

function createConservativeFallback(context: CondensedRepoContext): ValidatedProjectDraft {
  const bullets: ValidatedProjectDraft["bullets"] = [
    {
      text: `Engineered repository codebase utilizing ${context.primaryLanguage}${
        context.languages.length > 1 ? ` and ${context.languages.slice(1).join(", ")}` : ""
      }`,
      source: `GitHub repository language: ${context.primaryLanguage}`,
      confidence: "medium",
    },
  ];

  if (context.recentCommits.length > 0) {
    bullets.push({
      text: `Developed and committed core feature enhancements: "${context.recentCommits[0]}"`,
      source: `commit: ${context.recentCommits[0]}`,
      confidence: "high" as const,
    });
  }

  return {
    repo: context.name,
    summary:
      context.description && context.description !== "None provided"
        ? context.description
        : `Software repository built with ${context.primaryLanguage}`,
    bullets,
    skills:
      context.primaryLanguage && context.primaryLanguage !== "Unknown"
        ? [{ name: context.primaryLanguage, evidence: "primaryLanguage" }]
        : [],
    missing_info: [
      "What quantifiable metrics, performance improvements, or scale were achieved?",
      "What key architectural trade-offs did you make during development?",
    ],
  };
}
