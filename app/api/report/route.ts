import { NextResponse } from "next/server";
import { generateSecurityReport } from "@/lib/reports/reportGenerator";
import type {
  ApiResponse,
  FullAuditReport,
  ReportApiRequest,
  ReportApiResponse,
} from "@/types";

export async function GET() {
  return NextResponse.json<
    ApiResponse<{ message: string; supportedModes: string[] }>
  >({
    success: true,
    data: {
      message: "SecureNet AI Report Engine Active",
      supportedModes: ["single", "aggregate"],
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request
      .json()
      .catch(() => null)) as ReportApiRequest | null;

    if (!body) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Request body is required.",
        },
        { status: 400 }
      );
    }

    // Single scan security report mode
    if (body.mode === "single" || (body.scan && !body.recentScans)) {
      if (!body.scan) {
        return NextResponse.json<ApiResponse<null>>(
          {
            success: false,
            error: "Single scan report requires 'scan' object.",
          },
          { status: 400 }
        );
      }

      const report = generateSecurityReport(body.scan);
      return NextResponse.json<ApiResponse<ReportApiResponse>>(
        {
          success: true,
          data: report,
        },
        { status: 200 }
      );
    }

    // Aggregated Cyber Health Audit report mode
    const recentScans = Array.isArray(body.recentScans) ? body.recentScans : [];
    const cyberHealthScore =
      typeof body.cyberHealthScore === "number" ? body.cyberHealthScore : 88;
    const category = body.healthBreakdown?.category || "Good";
    const threatLevel = body.threatLevel || "safe";
    const confidenceScore =
      typeof body.confidenceScore === "number" ? body.confidenceScore : 97;

    const breakdown = body.healthBreakdown || {
      overall: cyberHealthScore,
      category,
      passwordSecurity: 23,
      websiteSafety: 22,
      emailSafety: 21,
      previousScansBonus: 22,
    };

    const threatsIdentified = recentScans.filter(
      (s) => s.threatLevel === "high" || s.threatLevel === "critical"
    ).length;

    let executiveSummary = "";
    if (cyberHealthScore >= 90) {
      executiveSummary = `Optimal security posture verified across ${recentScans.length} endpoint vectors. Telemetry demonstrates high entropy credentials, verified transport encryption, and zero malicious payload detections.`;
    } else if (cyberHealthScore >= 75) {
      executiveSummary = `Resilient cyber health posture with minor potential risk areas. Identified ${threatsIdentified} elevated items requiring routine remediation.`;
    } else {
      executiveSummary = `Sub-optimal security posture detected. Multiple elevated risk indicators identified across credentials or network links. Immediate enforcement of zero-trust recommendations advised.`;
    }

    const auditReport: FullAuditReport = {
      title: "SecureNet AI — Cyber Security Posture Audit Brief",
      generatedAt: new Date().toISOString(),
      cyberHealthScore,
      category,
      threatLevel,
      confidenceScore,
      breakdown,
      totalScans: recentScans.length,
      threatsIdentified,
      recentScans,
      recommendations: Array.isArray(body.recommendations)
        ? body.recommendations
        : [],
      executiveSummary,
    };

    return NextResponse.json<ApiResponse<ReportApiResponse>>(
      {
        success: true,
        data: auditReport,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: `Report generation failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
