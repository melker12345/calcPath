#!/usr/bin/env node
/**
 * Create (or reset the password of) the admin auth user.
 *
 * Run with:
 *   npx tsx scripts/create-admin.ts 'your-chosen-password'
 *
 * - Reads NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL
 *   from the project .env (no dotenv dependency; parsed here directly).
 * - Uses the service-role key to create the user with email already confirmed,
 *   so the admin can sign in immediately at /admin.
 * - If the user already exists, its password is reset to the one you pass.
 *
 * The password is your choice — whatever you pass here is what you type into the
 * admin sign-in form. Nothing is hard-coded.
 */
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv(): Record<string, string> {
  const envPath = path.join(process.cwd(), ".env");
  const out: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return out;
  for (const rawLine of fs.readFileSync(envPath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

async function main() {
  const password = process.argv[2];
  if (!password || password.length < 6) {
    console.error(
      "Usage: npx tsx scripts/create-admin.ts '<password>'  (min 6 characters)",
    );
    process.exit(1);
  }

  const env = loadEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = (env.ADMIN_EMAIL ?? "").split(",")[0]?.trim().toLowerCase();

  if (!url || !serviceRoleKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
    );
    process.exit(1);
  }
  if (!adminEmail) {
    console.error("Missing ADMIN_EMAIL in .env");
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  // Try to create; if the address is already registered, reset its password.
  const { data: created, error: createError } =
    await supabase.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });

  if (!createError && created.user) {
    console.log(`✓ Created admin user ${adminEmail}. You can now sign in at /admin.`);
    return;
  }

  const alreadyExists =
    createError?.message?.toLowerCase().includes("already") ||
    createError?.status === 422;

  if (!alreadyExists) {
    console.error("Failed to create admin user:", createError?.message);
    process.exit(1);
  }

  // Find the existing user and reset its password.
  const { data: list, error: listError } =
    await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (listError) {
    console.error("User exists but lookup failed:", listError.message);
    process.exit(1);
  }
  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === adminEmail,
  );
  if (!existing) {
    console.error(
      `User reported as existing but not found in the first page of results for ${adminEmail}.`,
    );
    process.exit(1);
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(
    existing.id,
    { password, email_confirm: true },
  );
  if (updateError) {
    console.error("Failed to reset admin password:", updateError.message);
    process.exit(1);
  }
  console.log(`✓ Reset password for existing admin user ${adminEmail}. Sign in at /admin.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
