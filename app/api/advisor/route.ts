import { NextResponse } from "next/server";
import { generateAdvisorResponse } from "@/lib/advisor/advisorEngine";
import type {
  AdvisorApiRequest,
  AdvisorApiResponse,
  ApiResponse,
} from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request
      .json()
      .catch(() => null)) as AdvisorApiRequest | null;

    if (!body || typeof body.query !== "string" || !body.query.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid request payload. 'query' string field is required.",
        },
        { status: 400 }
      );
    }

    const recentScans = Array.isArray(body.recentScans) ? body.recentScans : [];
    const cyberHealthScore =
      typeof body.cyberHealthScore === "number" ? body.cyberHealthScore : 88;
    const healthCategory = body.healthCategory || "Good";

    const result = generateAdvisorResponse(
      body.query,
      recentScans,
      cyberHealthScore,
      healthCategory
    );

    return NextResponse.json<ApiResponse<AdvisorApiResponse>>(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: `Advisor query failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
