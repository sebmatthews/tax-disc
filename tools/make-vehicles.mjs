// Generates test/vehicles.dat: the test vehicles for the matching check.
// One vehicle per line, in the 35-character batch layout set out in docs/rules.md.
// The output is the same every time it is run (fixed seed), so the file can be
// regenerated and compared. Run: node tools/make-vehicles.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pad = (n, w) => String(n).padStart(w, "0");
const ddmmyy = (y, m, d) => pad(d, 2) + pad(m, 2) + pad(y % 100, 2);

let seq = 0;
function rec({ fr, fuel = "P", co2 = 0, eng = 0, price = 0, first = "N", ls = "011026", reg }) {
  seq += 1;
  const mark = (reg ?? `TD${pad(seq, 3)}`).padEnd(8, " ").slice(0, 8);
  const line = mark + fr + fuel + pad(co2, 3) + pad(eng, 4) + pad(price, 6) + first + ls;
  if (line.length !== 35) throw new Error(`bad record length ${line.length}: ${line}`);
  return line;
}

const out = [];

// The worked examples in docs/rules.md, in order.
out.push(rec({ fr: "010612", co2: 145 }));
out.push(rec({ fr: "010612", fuel: "D", co2: 145 }));
out.push(rec({ fr: "150398", eng: 1400 }));
out.push(rec({ fr: "010784" }));
out.push(rec({ fr: "010649" }));
out.push(rec({ fr: "010522", fuel: "E" }));
out.push(rec({ fr: "010323", price: 45000 }));
out.push(rec({ fr: "010620", price: 45000 }));
out.push(rec({ fr: "010926", co2: 120, first: "Y" }));
out.push(rec({ fr: "010926", fuel: "D", co2: 120, first: "Y" }));

// Era boundaries.
for (const fr of ["280201", "010301", "310317", "010417"]) {
  for (const fuel of ["P", "D"]) out.push(rec({ fr, fuel, co2: 140, eng: 1600, price: 30000 }));
}

// Engine size boundary, era A.
for (const eng of [0, 1549, 1550, 9999]) out.push(rec({ fr: "010695", eng }));

// Era B band edges, petrol and diesel.
for (const co2 of [0, 100, 101, 120, 121, 150, 151, 170, 171, 190, 191, 225, 226, 999]) {
  for (const fuel of ["P", "D"]) out.push(rec({ fr: "150910", fuel, co2 }));
}

// Era C first-year band edges, petrol and diesel.
for (const co2 of [0, 50, 51, 100, 101, 130, 131, 150, 151, 190, 191, 255, 256, 999]) {
  for (const fuel of ["P", "D"]) out.push(rec({ fr: "010925", fuel, co2, first: "Y", ls: "010925" }));
}

// Supplement: price threshold, and the day before, on and after the fifth anniversary.
for (const price of [40000, 40001, 999999]) out.push(rec({ fr: "151022", price }));
for (const ls of ["140627", "150627", "160627"]) out.push(rec({ fr: "150622", price: 50000, ls }));
// Registered on 29 February: fifth anniversary is 28 February.
for (const ls of ["270229", "280229", "010329"]) out.push(rec({ fr: "290224", price: 50000, ls }));
// First licence never gets the supplement.
out.push(rec({ fr: "010926", co2: 140, price: 90000, first: "Y" }));

// Historic boundary: 39 and 40 years by calendar year.
out.push(rec({ fr: "311287", eng: 2000 }));
out.push(rec({ fr: "010186", eng: 2000 }));
out.push(rec({ fr: "311286", eng: 2000 }));
out.push(rec({ fr: "010150", eng: 2000 }));

// Date window: 49 is 2049, 50 is 1950.
out.push(rec({ fr: "311249" }));
out.push(rec({ fr: "010150", ls: "010190" }));
out.push(rec({ fr: "010100", co2: 130, ls: "010149" }));

// Invalid dates and leap years.
for (const fr of ["000126", "320126", "011326", "010026", "310426", "290223", "290224", "290200", "290100", "290296"]) {
  out.push(rec({ fr, co2: 130, ls: "011026" }));
}
for (const ls of ["000027", "311126", "290227", "290228"]) out.push(rec({ fr: "010120", co2: 130, ls }));
// First registration on the licence start date, and the day after.
out.push(rec({ fr: "011026", co2: 130, first: "Y" }));
out.push(rec({ fr: "021026", co2: 130, first: "Y" }));

// Bad codes. The batch checks letters exactly as given: lower case is an error.
for (const fuel of ["X", "p", " ", "H"]) out.push(rec({ fr: "010612", fuel, co2: 130 }));
for (const first of ["Q", "y", " "]) out.push(rec({ fr: "010612", co2: 130, first }));
// Error order: a bad date beats a bad fuel type.
out.push(rec({ fr: "320126", fuel: "X", first: "Q" }));

// Electric across eras, and an electric historic vehicle.
for (const fr of ["010695", "010610", "010620", "010180"]) out.push(rec({ fr, fuel: "E", co2: 0, first: "Y" }));

// Random fill, from a fixed seed, to a total of 300 vehicles.
// mulberry32: a small, well-known generator; same sequence on every machine.
let s = 20261005;
const rnd = (n) => {
  s = (s + 0x6d2b79f5) | 0;
  let x = Math.imul(s ^ (s >>> 15), 1 | s);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) % n;
};
while (out.length < 300) {
  const y = 1984 + rnd(43); // 1984 to 2026
  const m = 1 + rnd(12);
  const d = 1 + rnd(28);
  const fuel = ["P", "P", "P", "D", "D", "E"][rnd(6)];
  const lsY = Math.max(y, 2024) + rnd(3);
  out.push(rec({
    fr: ddmmyy(y, m, d),
    fuel,
    co2: fuel === "E" ? 0 : 60 + rnd(240),
    eng: 900 + rnd(2600),
    price: 8000 + rnd(80000),
    first: lsY === y ? "Y" : ["N", "N", "N", "Y"][rnd(4)],
    ls: ddmmyy(lsY, 1 + rnd(12), 1 + rnd(28)),
  }));
}

mkdirSync(join(root, "test"), { recursive: true });
writeFileSync(join(root, "test", "vehicles.dat"), out.join("\n") + "\n");
console.log(`Wrote ${out.length} vehicles to test/vehicles.dat`);
