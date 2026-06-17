/**
 * Seeds public milestone recovery templates into progress_backups.
 * Run: npx tsx scripts/seed-progress-templates.ts
 */
import { createAdminClient } from "../src/lib/supabase/admin";
import { buildTemplateBlob } from "../src/lib/cloud-progress";
import { hashPassword } from "../src/lib/password-hash";

const TEMPLATES: Array<{ pin: string; fraction: number; label: string }> = [
  { pin: "111111", fraction: 0.1, label: "~10% practice complete" },
  { pin: "222222", fraction: 0.25, label: "~25% practice complete" },
  { pin: "333333", fraction: 0.4, label: "~40% practice complete" },
  { pin: "444444", fraction: 0.5, label: "~50% practice complete" },
  { pin: "555555", fraction: 0.65, label: "~65% practice complete" },
  { pin: "666666", fraction: 0.75, label: "~75% practice complete" },
  { pin: "777777", fraction: 0.85, label: "~85% practice complete" },
  { pin: "888888", fraction: 0.95, label: "~95% practice complete" },
];

const TEMPLATE_PASSWORD = "template-readonly";

async function main() {
  const supabase = createAdminClient();
  const passwordHash = hashPassword(TEMPLATE_PASSWORD);
  const now = new Date().toISOString();

  for (const template of TEMPLATES) {
    const blob = buildTemplateBlob(template.fraction);
    const { error } = await supabase.from("progress_backups").upsert(
      {
        pin: template.pin,
        password_hash: passwordHash,
        blob,
        is_template: true,
        created_at: now,
        updated_at: now,
        last_accessed: now,
      },
      { onConflict: "pin" },
    );

    if (error) {
      console.error(`Failed to seed ${template.pin}:`, error.message);
      process.exitCode = 1;
      continue;
    }
    console.log(`Seeded ${template.pin} — ${template.label}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});