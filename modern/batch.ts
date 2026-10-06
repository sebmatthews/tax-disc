// Port of legacy/VEDBATCH.cbl: batch rating run.
// Reads one vehicle per line (35 chars), calls the rating rules,
// writes one result per line (17 chars). Record layouts match the COBOL exactly.

import { readFileSync, writeFileSync } from "node:fs";
import { calculateTax } from "./vedcalc.ts";
import type { Vehicle } from "./vedcalc.ts";

const [inName, outName] = process.argv.slice(2);
if (!inName || !outName) {
  console.error("USAGE: node modern/batch.ts INPUT-FILE OUTPUT-FILE");
  process.exit(8);
}

let input: string;
try {
  input = readFileSync(inName, "utf8");
} catch (err) {
  console.error(`VEDBATCH: CANNOT OPEN INPUT, STATUS 35`);
  process.exit(8);
}

function parseNumeric(slice: string): number {
  const n = parseInt(slice, 10);
  return Number.isNaN(n) ? 0 : n;
}

const lines = input.replace(/\n$/, "").split("\n");
const outputLines: string[] = [];

for (const line of lines) {
  if (line.length < 35) continue;
  const vehicle: Vehicle = {
    reg: line.slice(0, 8),
    firstReg: parseNumeric(line.slice(8, 14)),
    fuel: line.slice(14, 15),
    co2: parseNumeric(line.slice(15, 18)),
    engine: parseNumeric(line.slice(18, 22)),
    price: parseNumeric(line.slice(22, 28)),
    firstLic: line.slice(28, 29),
    licStart: parseNumeric(line.slice(29, 35)),
  };
  const result = calculateTax(vehicle);
  const rateStr = String(result.rate).padStart(5, "0");
  outputLines.push(vehicle.reg + rateStr + result.code);
}

try {
  writeFileSync(outName, outputLines.join("\n") + "\n");
} catch (err) {
  console.error(`VEDBATCH: CANNOT OPEN OUTPUT, STATUS 30`);
  process.exit(8);
}

console.log(`VEDBATCH: ${outputLines.length} VEHICLES RATED`);
