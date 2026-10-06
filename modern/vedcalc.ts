// Port of legacy/VEDCALC.cbl: vehicle excise duty rate calculation.
// Given one vehicle, returns the annual rate in whole pounds and a rule code.
// The COBOL is the specification; behaviour (including quirks) is preserved.

export interface Vehicle {
  reg: string;
  firstReg: number;
  fuel: string;
  co2: number;
  engine: number;
  price: number;
  firstLic: string;
  licStart: number;
}

export interface Result {
  rate: number;
  code: string;
}

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const ERA_B_RATES = [15, 35, 165, 220, 270, 380, 640];
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

function convertDate(dateIn: number): number | null {
  if (!Number.isFinite(dateIn) || dateIn < 0) return null;

  const dd = Math.floor(dateIn / 10000);
  const mm = Math.floor((dateIn % 10000) / 100);
  const yy = dateIn % 100;

  const ccyy = yy < 50 ? 2000 + yy : 1900 + yy;

  if (mm < 1 || mm > 12) return null;

  let maxDay = DAYS_IN_MONTH[mm - 1];
  if (mm === 2) {
    const rem4 = ccyy % 4;
    const rem100 = ccyy % 100;
    const rem400 = ccyy % 400;
    if (rem400 === 0 || (rem4 === 0 && rem100 !== 0)) {
      maxDay = 29;
    }
  }

  if (dd < 1 || dd > maxDay) return null;

  return ccyy * 10000 + mm * 100 + dd;
}

export function calculateTax(vehicle: Vehicle): Result {
  const firstRegDate = convertDate(vehicle.firstReg);
  if (firstRegDate === null) return { rate: 0, code: "E01" };

  const licStartDate = convertDate(vehicle.licStart);
  if (licStartDate === null) return { rate: 0, code: "E02" };

  if (firstRegDate > licStartDate) return { rate: 0, code: "E03" };

  const fuel = vehicle.fuel;
  if (fuel !== "P" && fuel !== "D" && fuel !== "E") return { rate: 0, code: "E04" };

  const firstLic = vehicle.firstLic;
  if (firstLic !== "Y" && firstLic !== "N") return { rate: 0, code: "E05" };

  const firstRegCCYY = Math.floor(firstRegDate / 10000);
  const licStartCCYY = Math.floor(licStartDate / 10000);
  const ageYears = licStartCCYY - firstRegCCYY;

  if (ageYears >= HISTORIC_YEARS) return { rate: 0, code: "HIST" };
  if (fuel === "E") return { rate: 0, code: "ELEC" };

  if (firstRegDate < ERA_A_END) {
    return vehicle.engine > ENG_SMALL_MAX
      ? { rate: ENG_LARGE_RATE, code: "ENG2" }
      : { rate: ENG_SMALL_RATE, code: "ENG1" };
  }

  if (firstRegDate < ERA_B_END) {
    let band: number;
    if (vehicle.co2 <= 100) band = 1;
    else if (vehicle.co2 <= 120) band = 2;
    else if (vehicle.co2 <= 150) band = 3;
    else if (vehicle.co2 <= 170) band = 4;
    else if (vehicle.co2 <= 190) band = 5;
    else if (vehicle.co2 <= 225) band = 6;
    else band = 7;
    if (fuel === "D" && band < 7) band += 1;
    return { rate: ERA_B_RATES[band - 1], code: "B" + band };
  }

  if (firstLic === "Y") {
    let band: number;
    if (vehicle.co2 <= 50) band = 1;
    else if (vehicle.co2 <= 100) band = 2;
    else if (vehicle.co2 <= 130) band = 3;
    else if (vehicle.co2 <= 150) band = 4;
    else if (vehicle.co2 <= 190) band = 5;
    else if (vehicle.co2 <= 255) band = 6;
    else band = 7;
    if (fuel === "D" && band < 7) band += 1;
    return { rate: FIRST_YEAR_RATES[band - 1], code: "F" + band };
  }

  let rate = STANDARD_RATE;
  let code = "STD";
  if (vehicle.price > SUPP_PRICE_MIN) {
    let fifthAnnivCCYY = firstRegCCYY + 5;
    let fifthAnnivMMDD = firstRegDate % 10000;
    if (fifthAnnivMMDD === 229) fifthAnnivMMDD = 228;
    const fifthAnniv = fifthAnnivCCYY * 10000 + fifthAnnivMMDD;
    if (licStartDate < fifthAnniv) {
      rate += SUPPLEMENT;
      code = "STDS";
    }
  }
  return { rate, code };
}

export function getDescription(code: string): string {
  switch (code) {
    case "E01": return "INVALID DATE OF FIRST REGISTRATION";
    case "E02": return "INVALID LICENCE START DATE";
    case "E03": return "FIRST REGISTRATION AFTER LICENCE START";
    case "E04": return "FUEL TYPE MUST BE P, D OR E";
    case "E05": return "FIRST LICENCE MUST BE Y OR N";
    case "HIST": return "HISTORIC VEHICLE, EXEMPT";
    case "ELEC": return "ELECTRIC, ZERO RATE";
    case "ENG1": return "PRE 2001, UP TO 1549 CC";
    case "ENG2": return "PRE 2001, OVER 1549 CC";
    case "STD": return "STANDARD RATE";
    case "STDS": return "STANDARD PLUS SUPPLEMENT";
    default:
      if (code.startsWith("B")) return "2001 TO 2017, BAND " + code[1];
      if (code.startsWith("F")) return "FIRST LICENCE, BAND " + code[1];
      return "";
  }
}
