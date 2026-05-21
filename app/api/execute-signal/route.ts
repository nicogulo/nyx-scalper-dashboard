import { NextRequest, NextResponse } from "next/server";

const VPS_API = process.env.NYX_API_URL || "http://43.134.67.78:3778";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${VPS_API}/api/execute-signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
