import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (payload) {
    console.log("Analytics event:", payload);
  }
  return NextResponse.json({ ok: true });
}
