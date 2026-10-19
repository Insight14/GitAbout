import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { ProjectDraft } from "@/lib/types";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: "#3b82f6",
    borderBottomStyle: "solid",
    paddingBottom: 8,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    color: "#3b82f6",
    marginTop: 2,
    fontFamily: "Helvetica-Bold",
  },
  contactBar: {
    flexDirection: "row",
    marginTop: 4,
    gap: 12,
    color: "#64748b",
    fontSize: 8.5,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    borderBottomWidth: 0.75,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginTop: 12,
    marginBottom: 6,
  },
  projectBlock: {
    marginBottom: 10,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  projectName: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  projectDate: {
    fontSize: 8,
    color: "#64748b",
  },
  projectSummary: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#475569",
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2.5,
    paddingLeft: 4,
  },
  bulletPoint: {
    width: 8,
    fontSize: 9,
    color: "#3b82f6",
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: "#1e293b",
  },
  bulletSource: {
    fontSize: 7.5,
    color: "#64748b",
    fontFamily: "Helvetica-Oblique",
  },
  skillsSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  skillPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    color: "#334155",
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 7,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 4,
  },
});

interface ResumePdfProps {
  username: string;
  name: string | null;
  bio: string | null;
  projects: ProjectDraft[];
  jobTitle?: string;
}

export function ResumePdfDocument({
  username,
  name,
  bio,
  projects,
  jobTitle,
}: ResumePdfProps) {
  // Aggregate verified skills across all projects
  const verifiedSkills = Array.from(
    new Set(projects.flatMap((p) => p.skills.map((s) => s.name)))
  );

  return (
    <Document title={`${username}-github-resume.pdf`} author="GitAbout">
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{name || username}</Text>
          <Text style={styles.subtitle}>
            {jobTitle || "Software Engineer • Evidence-Grounded Portfolio"}
          </Text>
          <View style={styles.contactBar}>
            <Text>GitHub: github.com/{username}</Text>
            <Text>•</Text>
            <Text>Portfolio: gitabout.com/{username}</Text>
            <Text>•</Text>
            <Text>Verified Codebase Evidence</Text>
          </View>
        </View>

        {/* Bio / Summary */}
        {bio && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Technical Profile</Text>
            <Text style={{ fontSize: 8.5, color: "#334155", lineHeight: 1.3 }}>
              {bio}
            </Text>
          </View>
        )}

        {/* Verified Skills */}
        {verifiedSkills.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Verified Technologies & Skills</Text>
            <View style={styles.skillsSection}>
              {verifiedSkills.map((skill, i) => (
                <Text key={i} style={styles.skillPill}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Strongest Projects */}
        <View>
          <Text style={styles.sectionTitle}>Public Engineering Projects</Text>
          {projects.map((proj, pIdx) => (
            <View key={pIdx} style={styles.projectBlock} wrap={false}>
              <View style={styles.projectHeader}>
                <Text style={styles.projectName}>{proj.repo}</Text>
                <Text style={styles.projectDate}>github.com/{username}/{proj.repo}</Text>
              </View>

              <Text style={styles.projectSummary}>{proj.summary}</Text>

              {proj.bullets.map((b, bIdx) => (
                <View key={bIdx} style={styles.bulletRow}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.bulletText}>
                    {b.text}{" "}
                    <Text style={styles.bulletSource}>
                      [{b.source}]
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated with GitAbout • Evidence-backed resume draft • All claims cited directly from repository artifacts
        </Text>
      </Page>
    </Document>
  );
}
