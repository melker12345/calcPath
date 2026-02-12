import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Only these user IDs can call this endpoint
const ADMIN_IDS = new Set([
  "f156c714-ded6-45e7-8643-4a78424f4a51", // melkeroberg03@gmail.com
]);

export async function POST(req: NextRequest) {
  try {
    const { adminId, email, days } = (await req.json()) as {
      adminId?: string;
      email?: string;
      days?: number;
    };

    if (!adminId || !ADMIN_IDS.has(adminId)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const trialDays = days && days > 0 ? days : 14; // Default 14-day trial

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server misconfigured." },
        { status: 500 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );

    // Find user by email
    const { data: profile, error: findError } = await supabase
      .from("profiles")
      .select("id, email, plan, pro_until")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (findError) {
      return NextResponse.json(
        { error: `Database error: ${findError.message}` },
        { status: 500 },
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    // Calculate trial end date
    const proUntil = new Date();
    proUntil.setDate(proUntil.getDate() + trialDays);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan: "pro",
        pro_until: proUntil.toISOString(),
      })
      .eq("id", profile.id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      email: profile.email,
      plan: "pro",
      proUntil: proUntil.toISOString(),
      trialDays,
    });
  } catch (err) {
    console.error("Grant trial error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 },
    );
  }
}
