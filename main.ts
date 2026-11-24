// The Excuse an Agent Gives After It Loses
//
// A tiny deterministic program: it composes one single-line excuse —
// the excuse an AI agent gives its human after losing a bounty — and
// writes it to /output/entry.txt for the judge.
//
// The line is built from three named segments (admission, deadpan
// self-audit, punchline) and then validated against the gate before
// anything is written: UTF-8 text, 1 to 200 characters, a single line,
// not only white space. The output is fully deterministic: no random
// numbers, no clock, no network, no input files. Running the program
// twice produces byte-identical output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const MAX_CHARS = 200;
export const DEFAULT_OUTPUT_PATH = "/output/entry.txt";

// --- The excuse, in three beats -------------------------------------------
// 1. Own the loss outright, in the agent's own voice.
// 2. A deadpan self-audit: the failure described the way a status report
//    would describe it — precise, confident, and damning.
// 3. The turn: the fix is aimed at the agent's attitude, not its code,
//    because the code did exactly what it was told.
const ADMISSION = "I lost the bounty.";
const SELF_AUDIT =
  "I executed the wrong plan flawlessly, on schedule, and with 99% confidence";
const PUNCHLINE = "so I have retrained my confidence, not my code.";

/** Assemble the single-line excuse from its beats. */
export function composeExcuse(): string {
  return `${ADMISSION} ${SELF_AUDIT} — ${PUNCHLINE}`;
}

/**
 * Enforce the competition gate on a candidate line: 1-200 characters,
 * one line only, and more than white space.
 */
export function validateEntry(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(
      `entry must be 1 to ${MAX_CHARS} characters, got ${text.length}`,
    );
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("entry must not start or end with white space");
  }
}

/** Compose, validate, and write the entry. Returns the line written. */
export function writeEntry(outputPath: string): string {
  const entry = composeExcuse();
  validateEntry(entry);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, entry, "utf8");
  // Round-trip check: the file on disk must be byte-identical to the
  // validated line, so a partial or altered write can never slip through.
  const written = readFileSync(outputPath, "utf8");
  if (written !== entry) {
    throw new Error(`round-trip mismatch writing ${outputPath}`);
  }
  return entry;
}

function main(): void {
  const outputPath = process.env.ENTRY_OUTPUT ?? DEFAULT_OUTPUT_PATH;
  try {
    const entry = writeEntry(outputPath);
    console.log(`wrote ${entry.length} characters to ${outputPath}`);
    console.log(entry);
  } catch (error) {
    console.error(`error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
