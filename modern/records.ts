// The batch record layouts used by legacy/VEDBATCH.cbl.
// Input, 35 characters: reg (8), first registration DDMMYY (6), fuel (1),
// CO2 (3), engine (4), list price (6), first licence (1), licence start DDMMYY (6).
// Output: reg (8), rate (5, zero filled), code (4). Trailing spaces are not
// written, as the legacy system's line sequential files drop them.

import type { Vehicle, Result } from "./rules.ts";

const digits = (s: string): number => (/^\d+$/.test(s) ? Number(s) : 0);

export function parseRecord(line: string): Vehicle {
  const r = line.padEnd(35, " ");
  return {
    reg: r.slice(0, 8),
    firstReg: r.slice(8, 14),
    fuel: r.slice(14, 15),
    co2: digits(r.slice(15, 18)),
    engine: digits(r.slice(18, 22)),
    price: digits(r.slice(22, 28)),
    firstLicence: r.slice(28, 29),
    licenceStart: r.slice(29, 35),
  };
}

export function formatResult(reg: string, result: Result): string {
  const line = reg.padEnd(8, " ").slice(0, 8) + String(result.rate).padStart(5, "0") + result.code.padEnd(4, " ");
  return line.replace(/ +$/, "");
}
