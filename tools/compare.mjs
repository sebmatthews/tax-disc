// Compares the old and new systems' answers for the test vehicles.
// Used by check.sh. Usage:
//   node tools/compare.mjs <vehicles> <expected> <legacy-run> <modern-run>

import { readFileSync, existsSync } from "node:fs";

const [vehiclesPath, expectedPath, legacyPath, modernPath] = process.argv.slice(2);
const lines = (p) => (existsSync(p) ? readFileSync(p, "utf8").replace(/\n$/, "").split("\n") : []);

const vehicles = lines(vehiclesPath);
const expected = lines(expectedPath);
const legacy = lines(legacyPath);
const modern = lines(modernPath);

const show = (line) => {
  if (line === undefined) return "(no answer)";
  const rate = Number(line.slice(8, 13));
  const code = line.slice(13).trim();
  return Number.isNaN(rate) ? JSON.stringify(line) : `£${rate} ${code}`;
};

console.log("");
console.log("TAX DISC MATCHING CHECK");
console.log("");

// The old system must still give its recorded answers, or the check means nothing.
const legacyDrift = expected.filter((e, i) => legacy[i] !== e).length + Math.max(0, legacy.length - expected.length);
if (legacyDrift > 0) {
  console.log(`The old system no longer gives its recorded answers (${legacyDrift} ${legacyDrift === 1 ? "differs" : "differ"}).`);
  console.log("The old system or the test vehicles have been changed. Stop and investigate.");
  process.exit(2);
}

console.log(`Test vehicles:              ${vehicles.length}`);
console.log(`Old system (COBOL) answers: ${legacy.length}`);
console.log(`New system answers:         ${modern.length}`);
console.log("");

const diffs = [];
for (let i = 0; i < expected.length; i++) {
  if (modern[i] !== expected[i]) diffs.push(i);
}
const extra = Math.max(0, modern.length - expected.length);

if (diffs.length === 0 && extra === 0) {
  console.log(`MATCH. All ${expected.length} vehicles get the same answer from the old and new systems.`);
  console.log("");
  process.exit(0);
}

if (diffs.length === 0) console.log(`NO MATCH. All ${expected.length} vehicles get the same answer, but the new system wrote extra answers.`);
else console.log(`NO MATCH. ${expected.length - diffs.length} of ${expected.length} vehicles get the same answer; ${diffs.length} ${diffs.length === 1 ? "does" : "do"} not.`);
if (extra > 0) console.log(`The new system also wrote ${extra} more ${extra === 1 ? "answer" : "answers"} than there are test vehicles.`);
console.log("");
for (const i of diffs.slice(0, 10)) {
  console.log(`  Vehicle ${i + 1}: ${vehicles[i] ?? "(none)"}`);
  console.log(`    old system: ${show(expected[i])}    new system: ${show(modern[i])}`);
}
if (diffs.length > 10) console.log(`  ...and ${diffs.length - 10} more.`);
console.log("");
process.exit(1);
