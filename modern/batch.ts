// VEDBATCH - VEHICLE EXCISE DUTY BATCH RATING RUN
//
// A like-for-like port of legacy/VEDBATCH.cbl. Reads one vehicle per
// line (35 characters), calls the rating rules, writes one result per
// line (17 characters). Record layouts match the COBOL exactly:
//
// Input:  REG X(8) FIRST-REG 9(6) FUEL X CO2 9(3) ENGINE 9(4)
//         PRICE 9(6) FIRST-LIC X LIC-START 9(6)
// Output: REG X(8) RATE 9(5) CODE X(4)
//
// Usage: node modern/batch.ts INPUT-FILE OUTPUT-FILE
//
// UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.

import { readFileSync, writeFileSync } from "node:fs";
import { calculateRate } from "./vedcalc.ts";
import type { Vehicle } from "./vedcalc.ts";

const [inputName, outputName] = process.argv.slice(2);

if (!inputName || !outputName) {
  console.log("USAGE: node modern/batch.ts INPUT-FILE OUTPUT-FILE");
  process.exit(8);
}

let inputText: string;
try {
  inputText = readFileSync(inputName, "utf8");
} catch {
  console.log("VEDBATCH: CANNOT OPEN INPUT");
  process.exit(8);
}

// LINE SEQUENTIAL records: the last line is a record even without a
// trailing newline.
const records = inputText.split("\n");
if (records.length > 0 && records[records.length - 1] === "") {
  records.pop();
}

const outLines: string[] = [];
for (const record of records) {
  // A short record is padded with spaces to the full 35 characters,
  // as a COBOL line sequential read would deliver it.
  const rec = record.padEnd(35, " ");
  const vehicle: Vehicle = {
    reg: rec.slice(0, 8),
    firstReg: rec.slice(8, 14),
    fuel: rec.slice(14, 15),
    co2: Number(rec.slice(15, 18)),
    engine: Number(rec.slice(18, 22)),
    price: Number(rec.slice(22, 28)),
    firstLic: rec.slice(28, 29),
    licStart: rec.slice(29, 35),
  };
  const result = calculateRate(vehicle);
  const rateOut = String(result.rate).padStart(5, "0");
  // The 17-character output record has its trailing spaces trimmed,
  // as GnuCOBOL's line sequential write does.
  const line = vehicle.reg + rateOut + result.code.padEnd(4, " ");
  outLines.push(line.trimEnd());
}

try {
  writeFileSync(outputName, outLines.join("\n") + "\n");
} catch {
  console.log("VEDBATCH: CANNOT OPEN OUTPUT");
  process.exit(8);
}

console.log(`VEDBATCH: ${outLines.length} VEHICLES RATED`);
