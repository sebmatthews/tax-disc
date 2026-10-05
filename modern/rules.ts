// Vehicle tax rating rules, carried over from legacy/VEDCALC.cbl.
// Behaviour is kept exactly as the legacy system has it, quirks included.

export type Vehicle = {
  reg: string;          // up to 8 characters
  firstReg: string;     // DDMMYY
  fuel: string;         // P, D or E
  co2: number;          // g/km, 0 to 999
  engine: number;       // cc, 0 to 9999
  price: number;        // whole pounds, 0 to 999999
  firstLicence: string; // Y or N
  licenceStart: string; // DDMMYY
};

export type Result = {
  rate: number;         // whole pounds
  code: string;         // rule or error code
};

type Ymd = { year: number; month: number; day: number };

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ERA_A_END = 20010301;   // registered before this: rated on engine size
const ERA_B_END = 20170401;   // registered before this: rated on CO2 band
const ENGINE_SMALL_MAX = 1549;
const ENGINE_SMALL_RATE = 210;
const ENGINE_LARGE_RATE = 345;
const ERA_B_LIMITS = [100, 120, 150, 170, 190, 225];
const ERA_B_RATES = [15, 35, 165, 220, 270, 380, 640];
const FIRST_YEAR_LIMITS = [50, 100, 130, 150, 190, 255];
const FIRST_YEAR_RATES = [10, 160, 210, 260, 700, 1600, 2700];
const STANDARD_RATE = 195;
const SUPPLEMENT = 425;
const SUPPLEMENT_PRICE_MIN = 40000;
const HISTORIC_YEARS = 40;

// DDMMYY to a date, using the legacy two-digit year window:
// 50 to 99 are 1950 to 1999, 00 to 49 are 2000 to 2049.
// Returns null when the six characters are not a real date.
export function readDate(ddmmyy: string): Ymd | null {
  if (!/^\d{6}$/.test(ddmmyy)) return null;
  const day = Number(ddmmyy.slice(0, 2));
  const month = Number(ddmmyy.slice(2, 4));
  const yy = Number(ddmmyy.slice(4, 6));
  const year = yy < 50 ? 2000 + yy : 1900 + yy;
  if (month < 1 || month > 12) return null;
  let maxDay = DAYS_IN_MONTH[month - 1];
  if (month === 2 && (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0))) maxDay = 29;
  if (day < 1 || day > maxDay) return null;
  return { year, month, day };
}

const asNumber = (d: Ymd): number => d.year * 10000 + d.month * 100 + d.day;

function band(value: number, limits: number[]): number {
  const i = limits.findIndex((limit) => value <= limit);
  return i === -1 ? limits.length + 1 : i + 1;
}

const dieselUplift = (b: number, fuel: string): number => (fuel === "D" && b < 7 ? b + 1 : b);

export function rateVehicle(v: Vehicle): Result {
  // Validation: the first error found wins.
  const first = readDate(v.firstReg);
  if (!first) return { rate: 0, code: "E01" };
  const start = readDate(v.licenceStart);
  if (!start) return { rate: 0, code: "E02" };
  const firstN = asNumber(first);
  const startN = asNumber(start);
  if (firstN > startN) return { rate: 0, code: "E03" };
  if (!["P", "D", "E"].includes(v.fuel)) return { rate: 0, code: "E04" };
  if (!["Y", "N"].includes(v.firstLicence)) return { rate: 0, code: "E05" };

  // Rates: the first rule that applies wins.
  if (start.year - first.year >= HISTORIC_YEARS) return { rate: 0, code: "HIST" };
  if (v.fuel === "E") return { rate: 0, code: "ELEC" };

  if (firstN < ERA_A_END) {
    return v.engine > ENGINE_SMALL_MAX
      ? { rate: ENGINE_LARGE_RATE, code: "ENG2" }
      : { rate: ENGINE_SMALL_RATE, code: "ENG1" };
  }

  if (firstN < ERA_B_END) {
    const b = dieselUplift(band(v.co2, ERA_B_LIMITS), v.fuel);
    return { rate: ERA_B_RATES[b - 1], code: `B${b}` };
  }

  if (v.firstLicence === "Y") {
    const b = dieselUplift(band(v.co2, FIRST_YEAR_LIMITS), v.fuel);
    return { rate: FIRST_YEAR_RATES[b - 1], code: `F${b}` };
  }

  if (v.price > SUPPLEMENT_PRICE_MIN) {
    // Fifth anniversary of first registration; 29 February falls back to 28 February.
    const anniversary = (first.year + 5) * 10000 + (first.month === 2 && first.day === 29 ? 228 : first.month * 100 + first.day);
    if (startN < anniversary) return { rate: STANDARD_RATE + SUPPLEMENT, code: "STDS" };
  }
  return { rate: STANDARD_RATE, code: "STD" };
}
