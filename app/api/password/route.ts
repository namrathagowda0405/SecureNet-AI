import { NextResponse } from "next/server";
import { analyzePassword } from "@/lib/scanners/passwordScanner";
import type { ApiResponse, PasswordScanResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.password !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error:
            "Invalid request payload. 'password' string field is required.",
        },
        { status: 400 }
      );
    }

    const result = analyzePassword(body.password);

    return NextResponse.json<ApiResponse<PasswordScanResponse>>(
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
        error: `Password analysis failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
