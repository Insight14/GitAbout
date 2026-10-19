import { describe, it, expect } from "vitest";
import {
  extractKeywordsFromText,
  performDeterministicTailoring,
} from "./tailorToJob";
import { ProjectDraft } from "../types";

const mockProjects: ProjectDraft[] = [
  {
    repo: "442ools",
    summary: "Football Computer Vision project analyzing players and goalkeepers",
    bullets: [
      {
        text: "Engineered computer vision pipelines utilizing OpenCV and Python",
        source: "requirements.txt: opencv-python",
        confidence: "high",
      },
      {
        text: "Configured multi-stage Dockerfile for containerized deployment",
        source: "Dockerfile",
        confidence: "high",
      },
    ],
    skills: [
      { name: "Python", evidence: "primaryLanguage" },
      { name: "Docker", evidence: "Dockerfile" },
      { name: "OpenCV", evidence: "requirements.txt" },
    ],
    missing_info: [],
    repoUrl: "https://github.com/Insight14/442ools",
    pushedAt: "2026-10-05T00:00:00Z",
  },
  {
    repo: "WorkingDay",
    summary: "Job platform automation optimized with parsing and autofill",
    bullets: [
      {
        text: "Developed robust line-level parsing engine in Python",
        source: "src/parser.py",
        confidence: "high",
      },
      {
        text: "Built REST API endpoints with FastAPI and Redis caching",
        source: "requirements.txt: redis",
        confidence: "medium",
      },
    ],
    skills: [
      { name: "Python", evidence: "primaryLanguage" },
      { name: "FastAPI", evidence: "requirements.txt" },
      { name: "Redis", evidence: "requirements.txt" },
    ],
    missing_info: [],
    repoUrl: "https://github.com/Insight14/WorkingDay",
    pushedAt: "2026-10-08T00:00:00Z",
  },
];

describe("tailorToJob engine", () => {
  it("extracts known tech stack keywords from job descriptions", () => {
    const jd = "Looking for a Senior Backend Engineer proficient in Python, Docker, Redis, and Kubernetes.";
    const keywords = extractKeywordsFromText(jd);

    expect(keywords).toContain("Python");
    expect(keywords).toContain("Docker");
    expect(keywords).toContain("Redis");
    expect(keywords).toContain("Kubernetes");
  });

  it("identifies matched skills and honestly flags missing skills without hallucination", () => {
    const jd = `
      Required Qualifications:
      - Proficient in Python and Docker
      - Experience with Kubernetes and Kafka in high-scale production
    `;

    const result = performDeterministicTailoring(mockProjects, {
      jobTitle: "Backend Cloud Engineer",
      jobText: jd,
    });

    const matchedSkillNames = result.matchedSkills.map((s) => s.skill);
    const missingSkillNames = result.missingSkills.map((s) => s.skill);

    // Python and Docker are directly matched
    expect(matchedSkillNames).toContain("Python");
    expect(matchedSkillNames).toContain("Docker");

    // Kubernetes and Kafka are both flagged as gaps (adjacent/missing)
    expect(missingSkillNames).toContain("Kubernetes");
    expect(missingSkillNames).toContain("Kafka");

    const k8sGap = result.missingSkills.find((s) => s.skill === "Kubernetes");
    expect(k8sGap?.status).toBe("adjacent");
    expect(k8sGap?.notes).toContain("Docker");

    // Has bridge the gap talking points for missing skills
    expect(result.interviewTalkingPointsForGaps.length).toBeGreaterThan(0);
  });

  it("re-ranks projects based on job description alignment", () => {
    // 1. Computer vision job -> 442ools should rank #1
    const cvJd = "We need a Computer Vision Engineer with OpenCV and Docker containerization experience.";
    const cvResult = performDeterministicTailoring(mockProjects, {
      jobTitle: "CV Engineer",
      jobText: cvJd,
    });

    expect(cvResult.tailoredProjects[0].repo).toBe("442ools");
    expect(cvResult.tailoredProjects[0].relevanceScore).toBeGreaterThan(
      cvResult.tailoredProjects[1].relevanceScore
    );

    // 2. Web API & Redis job -> WorkingDay should rank #1
    const apiJd = "We need a Backend Developer with FastAPI and Redis caching experience.";
    const apiResult = performDeterministicTailoring(mockProjects, {
      jobTitle: "Backend Developer",
      jobText: apiJd,
    });

    expect(apiResult.tailoredProjects[0].repo).toBe("WorkingDay");
    expect(apiResult.tailoredProjects[0].relevanceScore).toBeGreaterThan(
      apiResult.tailoredProjects[1].relevanceScore
    );
  });
});
