import { NextResponse } from "next/server";

const VPS_API = process.env.NYX_API_URL || "http://43.134.67.78:3778";

export async function GET() {
  try {
    const res = await fetch(`${VPS_API}/api/health`, {
      next: { revalidate: 0 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        timestamp: Date.now() / 1000,
        tests: [],
        summary: { passed: 0, total: 0, all_ok: false },
        error: error instanceof Error ? error.message : "Failed to reach API",
      },
      { status: 502 }
    );
  }
}
