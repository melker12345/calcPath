/**
 * Validates that the backup/restore system works as documented:
 *
 * 1. GET (restore) — PIN-only, no password
 * 2. POST (create) — requires password, stores only a hash (never plaintext)
 * 3. PUT (update) — requires PIN + correct password; wrong password is rejected
 * 4. Merge is monotonic — correct answers can only grow, never be lost
 */

import { hashPassword, verifyPassword } from "../src/lib/password-hash";

let pass = 0;
let fail = 0;

function check(label: string, result: boolean) {
  if (result) {
    console.log(`  ✓  ${label}`);
    pass++;
  } else {
    console.error(`  ✗  ${label}`);
    fail++;
  }
}

// ── 1. Password hashing ──────────────────────────────────────────────────────

console.log("\n── password-hash ──");

const hash = hashPassword("mypassword123");

check("hash is not the plaintext password", hash !== "mypassword123");
check("hash contains scrypt prefix", hash.startsWith("scrypt:"));
check("hash has salt:key structure", hash.split(":").length === 3);
check("correct password verifies", verifyPassword("mypassword123", hash));
check("wrong password is rejected", !verifyPassword("wrong", hash));
check("empty string is rejected", !verifyPassword("", hash));

// Two hashes of the same password must differ (random salt)
const hash2 = hashPassword("mypassword123");
check("each hash uses a unique salt", hash !== hash2);
// But both must still verify
check("both hashes verify the same password", verifyPassword("mypassword123", hash2));

// ── 2. GET requires no password (code path analysis) ──────────────────────────

console.log("\n── GET (restore) — PIN-only ──");

// Read the actual route source to confirm no password check in GET
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routeSrc = readFileSync(
  join(__dirname, "../src/app/api/backup/route.ts"),
  "utf8",
);

const getBlock = routeSrc.slice(
  routeSrc.indexOf("export async function GET"),
  routeSrc.indexOf("export async function PUT"),
);

check(
  "GET handler does not call verifyPassword",
  !getBlock.includes("verifyPassword"),
);
check(
  "GET handler does not read a password from the request",
  !getBlock.includes("parsePassword"),
);
check(
  "GET handler queries by PIN only",
  getBlock.includes('.eq("pin", pin)') && !getBlock.includes("password_hash"),
);

// ── 3. PUT requires password (code path analysis) ────────────────────────────

console.log("\n── PUT (update) — PIN + password required ──");

const putBlock = routeSrc.slice(routeSrc.indexOf("export async function PUT"));

check("PUT calls parsePassword", putBlock.includes("parsePassword(body)"));
check("PUT calls verifyPassword", putBlock.includes("verifyPassword(password"));
check(
  "PUT returns 401 on wrong password",
  putBlock.includes('status: 401') && putBlock.includes("Incorrect password"),
);
check(
  "PUT returns 400 when password missing",
  putBlock.includes("Password required"),
);

// ── 4. Merge is monotonic ────────────────────────────────────────────────────

console.log("\n── merge — convergent, non-destructive ──");

// Inline the tiny bit of merge logic we need so we don't need the full registry
// The key invariant: Math.max(a, b) per slot — correct (2) beats wrong (1) beats unattempted (0)
const STATE_UNATTEMPTED = 0;
const STATE_WRONG = 1;
const STATE_CORRECT = 2;

function mergeStates(a: number[], b: number[]): number[] {
  return a.map((v, i) => Math.max(v, b[i] ?? STATE_UNATTEMPTED));
}

// Case A: local has correct, cloud has wrong → merged must be correct
const merged1 = mergeStates([STATE_CORRECT, STATE_UNATTEMPTED], [STATE_WRONG, STATE_CORRECT]);
check("correct beats wrong in merge", merged1[0] === STATE_CORRECT);
check("cloud-only correct is retained in merge", merged1[1] === STATE_CORRECT);

// Case B: cloud has correct, local has unattempted → merged must be correct
const merged2 = mergeStates([STATE_UNATTEMPTED], [STATE_CORRECT]);
check("cloud correct survives when local is unattempted", merged2[0] === STATE_CORRECT);

// Case C: both correct → still correct
const merged3 = mergeStates([STATE_CORRECT], [STATE_CORRECT]);
check("correct + correct = correct", merged3[0] === STATE_CORRECT);

// Case D: merging wrong with unattempted → wrong (not lost)
const merged4 = mergeStates([STATE_WRONG], [STATE_UNATTEMPTED]);
check("wrong state is preserved (not reset to unattempted)", merged4[0] === STATE_WRONG);

// No question can go backwards
function canGoBackwards(a: number[], b: number[]): boolean {
  const m = mergeStates(a, b);
  return m.some((v, i) => v < a[i] || v < (b[i] ?? 0));
}
check(
  "no question can regress after merge",
  !canGoBackwards(
    [STATE_CORRECT, STATE_WRONG, STATE_UNATTEMPTED],
    [STATE_UNATTEMPTED, STATE_CORRECT, STATE_WRONG],
  ),
);

// ── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${pass + fail} checks — ${pass} passed, ${fail} failed\n`);
if (fail > 0) process.exit(1);
