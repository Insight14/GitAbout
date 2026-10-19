import { describe, it, expect } from "vitest";
import { detectWeakSpots, createInterviewPrepFallback } from "./interviewPrep";
import { CondensedRepoContext } from "../types";

describe("Interview Prep & Weak Spot Detection", () => {
  const baseContext: CondensedRepoContext = {
    name: "WorkingDay",
    description: "WorkDay job platform optimized with better parsing and autofill",
    primaryLanguage: "Python",
    languages: ["Python"],
    topics: ["automation", "job-applications"],
    stars: 2,
    lastUpdated: new Date().toISOString(),
    readmeExcerpt: "WorkDay job application tool with resume parsing.",
    keyDependencies: ["requirements.txt: [beautifulsoup4, requests]"],
    directoryStructure: ["src/main.py", "src/parser.py", "requirements.txt"],
    recentCommits: ["fix: line-level section segmentation"],
  };

  it("detects lack of automated tests as a weak spot", () => {
    const weakSpots = detectWeakSpots(baseContext);
    const testSpot = weakSpots.find((w) => w.area.includes("Test"));
    expect(testSpot).toBeDefined();
    expect(testSpot?.rehearsalTip.toLowerCase()).toContain("interview");
  });

  it("does not flag tests if test directory or test files exist", () => {
    const contextWithTests: CondensedRepoContext = {
      ...baseContext,
      directoryStructure: ["src/main.py", "tests/test_parser.py", "requirements.txt"],
    };
    const weakSpots = detectWeakSpots(contextWithTests);
    const testSpot = weakSpots.find((w) => w.area.includes("Test"));
    expect(testSpot).toBeUndefined();
  });

  it("flags short or minimal README as documentation weak spot", () => {
    const weakSpots = detectWeakSpots(baseContext);
    const docSpot = weakSpots.find((w) => w.area.includes("Documentation"));
    expect(docSpot).toBeDefined();
  });

  it("generates 6 categorized fallback interview questions with evidence citations", () => {
    const prep = createInterviewPrepFallback(baseContext);
    expect(prep.questions.length).toBe(6);

    const categories = prep.questions.map((q) => q.category);
    expect(categories).toContain("architecture");
    expect(categories).toContain("tradeoffs");
    expect(categories).toContain("challenge");
    expect(categories).toContain("testing");
    expect(categories).toContain("scaling");
    expect(categories).toContain("improvements");

    for (const q of prep.questions) {
      expect(q.talkingPoints.length).toBeGreaterThan(0);
      expect(q.talkingPoints[0].evidence.length).toBeGreaterThan(0);
      expect(q.suggestedAnswerStrategy.length).toBeGreaterThan(5);
    }
  });
});
