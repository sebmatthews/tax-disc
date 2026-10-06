// VEDCALC - VEHICLE EXCISE DUTY RATE CALCULATION
//
// A like-for-like port of legacy/VEDCALC.cbl. The COBOL is the
// specification: rules must not change, not even where they look odd.
//
// UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.
//
// DATES ARE HELD AS DDMMYY. TWO-DIGIT YEARS ARE WINDOWED:
// 50-99 = 1950-1999, 00-49 = 2000-2049 (Y2K REMEDIATION 1998).

export interface Vehicle {
  reg: string;       // PIC X(8)
  firstReg: string;  // PIC 9(6), DDMMYY
  fuel: string;      // PIC X, "P" "D" or "E"
  co2: number;       // PIC 9(3)
  engine: number;    // PIC 9(4)
  price: number;     // PIC 9(6)
  firstLic: string;  // PIC X, "Y" or "N"
  licStart: string;  // PIC 9(6), DDMMYY
}

export interface RateResult {
  rate: number;  // PIC 9(5), whole pounds
  code: string;  // PIC X(4)
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Era B CO2 band rates, bands 1-7.
const ERA_B_RATES = [15, 35, 165, 220, 270, 380, 640];

// Era C first year CO2 band rates, bands 1-7.
const FIRST_YEAR_RATES = [10, 160, 210, 260, 700, 1600, 2700];

const ERA_A_END = 20010301;
const ERA_B_END = 20170401;
const ENG_SMALL_MAX = 1549;
const ENG_SMALL_RATE = 210;
const ENG_LARGE_RATE = 345;
const STANDARD_RATE = 195;
const SUPPLEMENT = 425;
const SUPP_PRICE_MIN = 40000;
const HISTORIC_YEARS = 40;

// Matches the COBOL NUMERIC class test on a PIC 9(6) field: every
// character must be a digit. Spaces are not digits, so a blank date
// read from a batch record is not numeric here.
function isAllDigits(s: string): boolean {
  if (s.length === 0) return false;
  for (const ch of s) {
    if (ch < "0" || ch > "9") return false;
  }
  return true;
}

interface ConvertedDate {
  valid: boolean;
  ccyy: number;
  mm: number;
  dd: number;
  value: number; // CCYYMMDD as a number
}

// 8000-CONVERT-DATE: DDMMYY to CCYYMMDD, checked as a real date.
// Window: YY 50-99 is 19YY, YY 00-49 is 20YY.
function convertDate(ddmmyy: string): ConvertedDate {
  const invalid: ConvertedDate = { valid: false, ccyy: 0, mm: 0, dd: 0, value: 0 };
  if (!isAllDigits(ddmmyy)) return invalid;
  const dd = Number(ddmmyy.slice(0, 2));
  const mm = Number(ddmmyy.slice(2, 4));
  const yy = Number(ddmmyy.slice(4, 6));
  const ccyy = yy < 50 ? 2000 + yy : 1900 + yy;
  if (mm < 1 || mm > 12) return invalid;
  let maxDay = DAYS_IN_MONTH[mm - 1];
  if (mm === 2) {
    const rem4 = ccyy % 4;
    const rem100 = ccyy % 100;
    const rem400 = ccyy % 400;
    if (rem400 === 0 || (rem4 === 0 && rem100 !== 0)) maxDay = 29;
  }
  if (dd < 1 || dd > maxDay) return invalid;
  return { valid: true, ccyy, mm, dd, value: ccyy * 10000 + mm * 100 + dd };
}

export function calculateRate(vehicle: Vehicle): RateResult {
  let rate = 0;
  let code = "";

  // 1000-VALIDATE. FIRST ERROR FOUND WINS.
  const firstReg = convertDate(vehicle.firstReg);
  if (!firstReg.valid) {
    return { rate, code: "E01" };
  }
  const licStart = convertDate(vehicle.licStart);
  if (!licStart.valid) {
    return { rate, code: "E02" };
  }
  if (firstReg.value > licStart.value) {
    return { rate, code: "E03" };
  }
  const fuel = vehicle.fuel;
  if (fuel !== "P" && fuel !== "D" && fuel !== "E") {
    return { rate, code: "E04" };
  }
  if (vehicle.firstLic !== "Y" && vehicle.firstLic !== "N") {
    return { rate, code: "E05" };
  }

  // 2000-CALCULATE. FIRST RULE THAT APPLIES WINS.
  const ageYears = licStart.ccyy - firstReg.ccyy;
  if (ageYears >= HISTORIC_YEARS) {
    return { rate: 0, code: "HIST" };
  }
  if (fuel === "E") {
    return { rate: 0, code: "ELEC" };
  }

  if (firstReg.value < ERA_A_END) {
    // 3000-ERA-A, registered before 1 March 2001. Engine size.
    if (vehicle.engine > ENG_SMALL_MAX) {
      return { rate: ENG_LARGE_RATE, code: "ENG2" };
    }
    return { rate: ENG_SMALL_RATE, code: "ENG1" };
  }

  if (firstReg.value < ERA_B_END) {
    // 4000-ERA-B, 1 March 2001 to 31 March 2017. CO2 bands.
    const co2 = vehicle.co2;
    let band: number;
    if (co2 <= 100) band = 1;
    else if (co2 <= 120) band = 2;
    else if (co2 <= 150) band = 3;
    else if (co2 <= 170) band = 4;
    else if (co2 <= 190) band = 5;
    else if (co2 <= 225) band = 6;
    else band = 7;
    if (fuel === "D" && band < 7) band += 1;
    return { rate: ERA_B_RATES[band - 1], code: "B" + band };
  }

  // 5000-ERA-C, from 1 April 2017. First year or standard rate.
  if (vehicle.firstLic === "Y") {
    const co2 = vehicle.co2;
    let band: number;
    if (co2 <= 50) band = 1;
    else if (co2 <= 100) band = 2;
    else if (co2 <= 130) band = 3;
    else if (co2 <= 150) band = 4;
    else if (co2 <= 190) band = 5;
    else if (co2 <= 255) band = 6;
    else band = 7;
    if (fuel === "D" && band < 7) band += 1;
    return { rate: FIRST_YEAR_RATES[band - 1], code: "F" + band };
  }

  rate = STANDARD_RATE;
  code = "STD";
  if (vehicle.price > SUPP_PRICE_MIN) {
    let faCcyy = firstReg.ccyy + 5;
    let faMmdd = firstReg.mm * 100 + firstReg.dd;
    if (faMmdd === 229) faMmdd = 228;
    const fifthAnniv = faCcyy * 10000 + faMmdd;
    if (licStart.value < fifthAnniv) {
      rate += SUPPLEMENT;
      code = "STDS";
    }
  }
  return { rate, code };
}
