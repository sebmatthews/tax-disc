// Batch rating run, the replacement for legacy/VEDBATCH.
// Usage: node modern/batch.ts <input-file> <output-file>

import { readFileSync, writeFileSync } from "node:fs";
import { rateVehicle } from "./rules.ts";
import { parseRecord, formatResult } from "./records.ts";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node modern/batch.ts <input-file> <output-file>");
  process.exit(8);
}

const lines = readFileSync(input, "utf8").split("\n").filter((line) => line.length > 0);
const results = lines.map((line) => {
  const vehicle = parseRecord(line);
  return formatResult(vehicle.reg, rateVehicle(vehicle));
});
writeFileSync(output, results.map((r) => r + "\n").join(""));
console.log(`${results.length} vehicles rated`);
