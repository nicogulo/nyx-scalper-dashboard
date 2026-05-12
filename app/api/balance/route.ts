import { NextResponse } from "next/server";

const VPS_API = process.env.NYX_API_URL || "http://43.134.67.78:3778";

export async function GET() {
  try {
    const res = await fetch(`${VPS_API}/api/balance`, { next: { revalidate: 10 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
