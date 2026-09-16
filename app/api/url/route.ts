import { NextResponse } from "next/server";
import { analyzeUrl } from "@/lib/scanners/urlScanner";
import type { ApiResponse, UrlScanResponse } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body.url !== "string") {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: "Invalid request payload. 'url' string field is required.",
        },
        { status: 400 }
      );
    }

    const result = analyzeUrl(body.url);

    return NextResponse.json<ApiResponse<UrlScanResponse>>(
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
        error: `URL analysis failed: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
