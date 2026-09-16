import { NextResponse } from "next/server";
import { analyzeEmail } from "@/lib/scanners/emailScanner";
import type { ApiResponse, EmailScanResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.emailText !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            "Invalid request payload. 'emailText' string field is required.",
        },
        { status: 400 }
      );
    }

    const result = analyzeEmail(body.emailText);

    return NextResponse.json<ApiResponse<EmailScanResponse>>(
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
        error: `Email analysis failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
