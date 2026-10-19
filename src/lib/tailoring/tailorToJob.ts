import { GoogleGenAI, Type } from "@google/genai";
import { JOB_TAILORING_SYSTEM_PROMPT } from "../llm/prompts";
import {
  JobTailoringResponseSchema,
  ValidatedJobTailoring,
} from "../llm/schemas";
import {
  ProjectDraft,
  JobDescriptionInput,
  JobTailoringResult,
  SkillMatch,
  TailoredProjectDraft,
  GapTalkingPoint,
} from "../types";
import { getGeminiModelName } from "../llm/gemini";

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

const COMMON_TECH_KEYWORDS = [
  "Python",
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "Golang",
  "Rust",
  "Java",
  "C++",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST",
  "FastAPI",
  "Flask",
  "Django",
  "Tailwind",
  "PyTorch",
  "TensorFlow",
  "OpenCV",
  "Computer Vision",
  "Machine Learning",
  "CI/CD",
  "Kafka",
  "RabbitMQ",
  "Linux",
  "Microservices",
];

const ADJACENT_SKILL_MAP: Record<string, string[]> = {
  Kubernetes: ["Docker", "Containerization", "ECS"],
  Kafka: ["Redis", "RabbitMQ", "Message Queues"],
  GraphQL: ["REST", "API"],
  Golang: ["C++", "Rust", "Backend"],
  AWS: ["GCP", "Cloud", "Docker", "Render"],
};

export function extractKeywordsFromText(text: string): string[] {
  const found: string[] = [];
  const lowerText = text.toLowerCase();

  for (const kw of COMMON_TECH_KEYWORDS) {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text) || (kw === "Next.js" && lowerText.includes("next.js"))) {
      if (!found.includes(kw)) {
        found.push(kw);
      }
    }
  }

  return found;
}

export function performDeterministicTailoring(
  projects: ProjectDraft[],
  jobInput: JobDescriptionInput
): JobTailoringResult {
  const jobTitle = jobInput.jobTitle?.trim() || "Target Engineering Role";
  const jdKeywords = extractKeywordsFromText(jobInput.jobText);

  // 1. Gather all candidate verified skills
  const candidateSkillsMap = new Map<string, { repo: string; evidence: string }>();
  for (const proj of projects) {
    for (const s of proj.skills) {
      candidateSkillsMap.set(s.name.toLowerCase(), {
        repo: proj.repo,
        evidence: s.evidence,
      });
    }
  }

  // 2. Identify Matched vs Missing Skills
  const matchedSkills: SkillMatch[] = [];
  const missingSkills: SkillMatch[] = [];

  for (const kw of jdKeywords) {
    const exact = candidateSkillsMap.get(kw.toLowerCase());
    if (exact) {
      matchedSkills.push({
        skill: kw,
        status: "matched",
        matchedRepo: exact.repo,
        evidence: exact.evidence,
        notes: `Verified in repository "${exact.repo}" (${exact.evidence})`,
      });
    } else {
      // Check for adjacent experience
      const adjList = ADJACENT_SKILL_MAP[kw] || [];
      const foundAdjacent = adjList.find((adj) =>
        candidateSkillsMap.has(adj.toLowerCase())
      );

      if (foundAdjacent) {
        const adjDetail = candidateSkillsMap.get(foundAdjacent.toLowerCase());
        missingSkills.push({
          skill: kw,
          status: "adjacent",
          matchedRepo: adjDetail?.repo,
          evidence: adjDetail?.evidence,
          notes: `Adjacent experience found in ${foundAdjacent} (${adjDetail?.repo}). No direct ${kw} evidence.`,
        });
      } else {
        missingSkills.push({
          skill: kw,
          status: "missing",
          notes: `Not detected in public repositories.`,
        });
      }
    }
  }

  // 3. Score & Reorder Projects
  const tailoredProjects: TailoredProjectDraft[] = projects.map((proj) => {
    let score = 30; // base score
    const matchedForProj: string[] = [];

    // Check project skills
    for (const s of proj.skills) {
      const match = jdKeywords.find(
        (k) => k.toLowerCase() === s.name.toLowerCase()
      );
      if (match) {
        score += 25;
        matchedForProj.push(match);
      }
    }

    // Check bullets for keywords
    const highlightedBullets = proj.bullets.map((b) => {
      const bLower = b.text.toLowerCase();
      const isMatch = jdKeywords.some((kw) => bLower.includes(kw.toLowerCase()));
      if (isMatch) score += 5;
      return {
        ...b,
        isDirectMatch: isMatch,
      };
    });

    // Check repo description / summary
    const summaryLower = (proj.summary + " " + proj.repo).toLowerCase();
    for (const kw of jdKeywords) {
      if (summaryLower.includes(kw.toLowerCase()) && !matchedForProj.includes(kw)) {
        matchedForProj.push(kw);
        score += 10;
      }
    }

    const cappedScore = Math.min(100, score);
    const reason =
      matchedForProj.length > 0
        ? `Directly aligns with ${matchedForProj.slice(0, 3).join(", ")} requirements.`
        : `Demonstrates full-stack development and version control practices.`;

    return {
      repo: proj.repo,
      relevanceScore: cappedScore,
      relevanceReason: reason,
      matchedSkills: Array.from(new Set(matchedForProj)),
      originalDraft: proj,
      highlightedBullets,
    };
  });

  // Sort descending by relevanceScore
  tailoredProjects.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Calculate overall match score
  const totalKeywords = jdKeywords.length || 1;
  const matchRatio = matchedSkills.length / totalKeywords;
  const matchScore = Math.min(100, Math.round(matchRatio * 100));

  // Bridge the Gap talking points
  const interviewTalkingPointsForGaps: GapTalkingPoint[] = missingSkills.map((m) => {
    const adj = ADJACENT_SKILL_MAP[m.skill];
    const suggestion = adj
      ? `Acknowledge that ${m.skill} is not currently in your public portfolio, but explain your deep familiarity with adjacent technologies like ${adj.join(" and ")}.`
      : `Be candid about ${m.skill}: explain your foundation in related tooling and describe a concrete plan or fast ramp-up roadmap to master it in production.`;

    return {
      missingSkill: m.skill,
      recommendation: suggestion,
    };
  });

  return {
    jobTitle,
    company: jobInput.company,
    matchScore,
    overallSummary: `Candidate matches ${matchedSkills.length} of ${totalKeywords} core technologies detected in the job description. Top alignment observed in ${tailoredProjects[0]?.repo || "primary repository"}.`,
    matchedSkills,
    missingSkills,
    tailoredProjects,
    interviewTalkingPointsForGaps,
    analyzedAt: new Date().toISOString(),
  };
}

export async function tailorProjectsToJob(
  projects: ProjectDraft[],
  jobInput: JobDescriptionInput
): Promise<JobTailoringResult> {
  const deterministicResult = performDeterministicTailoring(projects, jobInput);

  // If Gemini API is available, enrich with AI reasoning
  try {
    const client = getClient();
    const modelName = getGeminiModelName();

    const promptPayload = {
      jobTitle: jobInput.jobTitle,
      company: jobInput.company,
      jobDescription: jobInput.jobText,
      candidateProjects: projects.map((p) => ({
        repo: p.repo,
        summary: p.summary,
        skills: p.skills,
        bullets: p.bullets,
      })),
      deterministicAnalysis: {
        matchedSkills: deterministicResult.matchedSkills,
        missingSkills: deterministicResult.missingSkills,
      },
    };

    const userPrompt = `Analyze this Job Description against the candidate's existing projects:
\`\`\`json
${JSON.stringify(promptPayload, null, 2)}
\`\`\`

Strictly reorder the projects by relevance to the JD, highlight matching bullets (without inventing new bullets), and provide actionable "Bridge the Gap" interview strategies for every missing skill.`;

    const response = await client.models.generateContent({
      model: modelName,
      contents: [userPrompt],
      config: {
        systemInstruction: JOB_TAILORING_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobTitle: { type: Type.STRING },
            matchScore: { type: Type.NUMBER },
            overallSummary: { type: Type.STRING },
            matchedSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    enum: ["matched", "missing", "adjacent"],
                  },
                  matchedRepo: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  notes: { type: Type.STRING },
                },
                required: ["skill", "status"],
              },
            },
            missingSkills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  skill: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    enum: ["matched", "missing", "adjacent"],
                  },
                  notes: { type: Type.STRING },
                },
                required: ["skill", "status"],
              },
            },
            tailoredProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  repo: { type: Type.STRING },
                  relevanceScore: { type: Type.NUMBER },
                  relevanceReason: { type: Type.STRING },
                  matchedSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["repo", "relevanceScore", "relevanceReason", "matchedSkills"],
              },
            },
            interviewTalkingPointsForGaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  missingSkill: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ["missingSkill", "recommendation"],
              },
            },
          },
          required: [
            "jobTitle",
            "matchScore",
            "overallSummary",
            "matchedSkills",
            "missingSkills",
            "tailoredProjects",
            "interviewTalkingPointsForGaps",
          ],
        },
        temperature: 0.2,
      },
    });

    const raw = response.text || "";
    const parsed = JSON.parse(raw);
    const validated = JobTailoringResponseSchema.safeParse(parsed);

    if (validated.success) {
      // Map back to original project objects to ensure no data loss
      const reorderedProjects: TailoredProjectDraft[] = [];
      const origMap = new Map(projects.map((p) => [p.repo.toLowerCase(), p]));

      for (const item of validated.data.tailoredProjects) {
        const orig = origMap.get(item.repo.toLowerCase());
        if (orig) {
          const highlightedBullets = orig.bullets.map((b) => {
            const isMatch = item.matchedSkills.some((s) =>
              b.text.toLowerCase().includes(s.toLowerCase())
            );
            return {
              ...b,
              isDirectMatch: isMatch,
            };
          });

          reorderedProjects.push({
            repo: orig.repo,
            relevanceScore: item.relevanceScore,
            relevanceReason: item.relevanceReason,
            matchedSkills: item.matchedSkills,
            originalDraft: orig,
            highlightedBullets,
          });
        }
      }

      // Append any projects not mentioned by LLM at the bottom
      for (const orig of projects) {
        if (!reorderedProjects.some((r) => r.repo === orig.repo)) {
          reorderedProjects.push({
            repo: orig.repo,
            relevanceScore: 40,
            relevanceReason: "Secondary portfolio demonstration.",
            matchedSkills: [],
            originalDraft: orig,
            highlightedBullets: orig.bullets.map((b) => ({ ...b, isDirectMatch: false })),
          });
        }
      }

      return {
        jobTitle: validated.data.jobTitle || deterministicResult.jobTitle,
        company: jobInput.company,
        matchScore: validated.data.matchScore,
        overallSummary: validated.data.overallSummary,
        matchedSkills: validated.data.matchedSkills,
        missingSkills: validated.data.missingSkills,
        tailoredProjects: reorderedProjects,
        interviewTalkingPointsForGaps: validated.data.interviewTalkingPointsForGaps,
        analyzedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    console.warn("[JobTailoring] AI call failed, falling back to deterministic matching:", err);
  }

  return deterministicResult;
}
