import { NextResponse } from "next/server";

/** @deprecated Snapshot sync retired — use /api/backup instead. */
export async function POST() {
  return NextResponse.json(
    { error: "Snapshot sync is retired. Use cloud backup at /account instead." },
    { status: 410 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Snapshot sync is retired. Use cloud backup at /account instead." },
    { status: 410 },
  );
}