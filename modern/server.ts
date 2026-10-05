// Vehicle tax rate enquiry on the web, the replacement for the legacy green
// screen (legacy/VEDENQ). Reads what is typed the same way the green screen does.
// Usage: node modern/server.ts   then open http://localhost:3000

import { createServer } from "node:http";
import { rateVehicle } from "./rules.ts";
import type { Vehicle, Result } from "./rules.ts";

const PORT = 3000;

// Fields in the green screen's order, with the green screen's field widths.
type Field = { name: string; label: string; hint: string; width: number; numeric: boolean };
const FIELDS: Field[] = [
  { name: "reg", label: "Registration number", hint: "Up to 8 characters, for example AB12CDE", width: 8, numeric: false },
  { name: "firstReg", label: "Date of first registration", hint: "Day, month and year as six digits, for example 010612 for 1 June 2012", width: 6, numeric: true },
  { name: "fuel", label: "Fuel type", hint: "", width: 1, numeric: false },
  { name: "co2", label: "CO2 emissions", hint: "In grams per kilometre (g/km)", width: 3, numeric: true },
  { name: "engine", label: "Engine size", hint: "In cubic centimetres (cc)", width: 4, numeric: true },
  { name: "price", label: "List price", hint: "In whole pounds, when new", width: 6, numeric: true },
  { name: "firstLicence", label: "Is this the vehicle's first licence?", hint: "", width: 1, numeric: false },
  { name: "licenceStart", label: "Licence start date", hint: "Day, month and year as six digits, for example 011026 for 1 October 2026", width: 6, numeric: true },
];

const MESSAGES: Record<string, string> = {
  E01: "Invalid date of first registration",
  E02: "Invalid licence start date",
  E03: "First registration after licence start",
  E04: "Fuel type must be P, D or E",
  E05: "First licence must be Y or N",
};

function describe(code: string): string {
  if (code === "HIST") return "Historic vehicle, exempt";
  if (code === "ELEC") return "Electric, zero rate";
  if (code === "ENG1") return "Pre 2001, up to 1549 cc";
  if (code === "ENG2") return "Pre 2001, over 1549 cc";
  if (code === "STD") return "Standard rate";
  if (code === "STDS") return "Standard plus supplement";
  if (code.startsWith("B")) return `2001 to 2017, band ${code.slice(1)}`;
  if (code.startsWith("F")) return `First licence, band ${code.slice(1)}`;
  return "";
}

// As the green screen: numbers are typed as text; blank, or anything that is
// not a whole number, is read as zero; numbers are shown back with leading zeros.
function toNumber(text: string): number {
  const t = text.trim();
  return /^\d+$/.test(t) ? Number(t) : 0;
}

type Typed = Record<string, string>;

function readForm(body: string): { typed: Typed; vehicle: Vehicle } {
  const params = new URLSearchParams(body);
  const typed: Typed = {};
  for (const f of FIELDS) typed[f.name] = (params.get(f.name) ?? "").slice(0, f.width);
  // Letters to capitals, as the green screen does.
  typed.fuel = typed.fuel.toUpperCase();
  typed.firstLicence = typed.firstLicence.toUpperCase();
  for (const f of FIELDS) {
    if (f.numeric) typed[f.name] = String(toNumber(typed[f.name])).padStart(f.width, "0");
  }
  const vehicle: Vehicle = {
    reg: typed.reg.padEnd(8, " "),
    firstReg: typed.firstReg,
    fuel: typed.fuel === "" ? " " : typed.fuel,
    co2: Number(typed.co2),
    engine: Number(typed.engine),
    price: Number(typed.price),
    firstLicence: typed.firstLicence === "" ? " " : typed.firstLicence,
    licenceStart: typed.licenceStart,
  };
  return { typed, vehicle };
}

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function radios(name: string, legend: string, options: [string, string][], value: string): string {
  const items = options
    .map(([v, text]) => `
          <div class="radio">
            <input type="radio" id="${name}-${v}" name="${name}" value="${v}"${value === v ? " checked" : ""}>
            <label for="${name}-${v}">${text}</label>
          </div>`)
    .join("");
  return `
        <fieldset class="group">
          <legend class="label">${legend}</legend>
          <div class="radios">${items}
          </div>
        </fieldset>`;
}

function input(f: Field, value: string): string {
  const cls = f.width <= 4 ? "input w4" : f.width <= 6 ? "input w6" : "input w10";
  return `
        <div class="group">
          <label class="label" for="${f.name}">${f.label}</label>
          ${f.hint ? `<div class="hint" id="${f.name}-hint">${f.hint}</div>` : ""}
          <input class="${cls}" id="${f.name}" name="${f.name}" type="text" maxlength="${f.width}"
            ${f.numeric ? 'inputmode="numeric"' : 'autocapitalize="characters"'} autocomplete="off" spellcheck="false"
            ${f.hint ? `aria-describedby="${f.name}-hint"` : ""} value="${esc(value)}">
        </div>`;
}

function page(typed: Typed, result: Result | null): string {
  const fields = FIELDS.map((f) => {
    if (f.name === "fuel") return radios("fuel", f.label, [["P", "Petrol"], ["D", "Diesel"], ["E", "Electric"]], typed.fuel ?? "");
    if (f.name === "firstLicence") return radios("firstLicence", f.label, [["Y", "Yes"], ["N", "No"]], typed.firstLicence ?? "");
    return input(f, typed[f.name] ?? "");
  }).join("");

  let outcome = "";
  if (result && MESSAGES[result.code]) {
    outcome = `
      <div class="error-summary" role="alert">
        <h2 class="error-title">There is a problem</h2>
        <p>${MESSAGES[result.code]}</p>
        <p class="code">Rule code ${result.code}</p>
      </div>`;
  } else if (result) {
    const firstWord = (typed.reg ?? "").split(" ")[0];
    outcome = `
      <div class="panel" role="status">
        <p class="panel-caption">Annual vehicle tax${firstWord ? ` for ${esc(firstWord)}` : ""}</p>
        <p class="panel-rate">£${result.rate.toLocaleString("en-GB")}</p>
        <p class="panel-rule">${describe(result.code)} <span class="tag">${result.code}</span></p>
      </div>`;
  }

  return `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Check your vehicle tax rate - UK Government Demo Service</title>
  <style>
    :root { --text: #0b0c0c; --secondary: #505a5f; --border: #b1b4b6; --focus: #ffdd00; --link: #1d70b8;
            --brand: #1d70b8; --button: #00703c; --button-shadow: #002d18; --error: #d4351c; --panel: #00703c; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; color: var(--text); background: #fff;
           font-size: 19px; line-height: 1.32; -webkit-font-smoothing: antialiased; }
    .header { background: #0b0c0c; color: #fff; border-bottom: 10px solid var(--brand); }
    .header-inner, .banner-inner, main { max-width: 960px; margin: 0 auto; padding: 0 30px; }
    .header-inner { padding-top: 14px; padding-bottom: 14px; font-weight: 700; font-size: 24px; letter-spacing: 0.2px; }
    .banner { border-bottom: 1px solid var(--border); }
    .banner-inner { padding-top: 10px; padding-bottom: 10px; font-size: 16px; }
    .phase { display: inline-block; background: var(--brand); color: #fff; font-weight: 700; padding: 2px 8px 1px;
             margin-right: 10px; text-transform: uppercase; letter-spacing: 1px; font-size: 14px; }
    main { padding-top: 40px; padding-bottom: 60px; }
    .layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 30px; }
    @media (max-width: 760px) { .layout { grid-template-columns: 1fr; } .header-inner, .banner-inner, main { padding: 0 15px; }
      .header-inner { padding-top: 12px; padding-bottom: 12px; } .banner-inner { padding-top: 10px; padding-bottom: 10px; } main { padding-top: 30px; } }
    h1 { font-size: 48px; line-height: 1.04; margin: 0 0 30px; font-weight: 700; }
    @media (max-width: 760px) { h1 { font-size: 32px; } }
    .lede { font-size: 24px; margin: 0 0 30px; }
    .group { margin: 0 0 30px; border: 0; padding: 0; }
    .label { display: block; font-weight: 700; margin-bottom: 5px; padding: 0; }
    .hint { color: var(--secondary); margin-bottom: 15px; }
    .input { font: inherit; font-size: 19px; height: 40px; padding: 5px; border: 2px solid var(--text); border-radius: 0; }
    .input.w4 { width: 5.5em; } .input.w6 { width: 7.5em; } .input.w10 { width: 11em; }
    .input:focus { outline: 3px solid var(--focus); outline-offset: 0; box-shadow: inset 0 0 0 2px; }
    .radios { display: flex; flex-direction: column; gap: 10px; }
    .radio { display: flex; align-items: center; gap: 10px; }
    .radio input { width: 32px; height: 32px; margin: 0; accent-color: var(--text); }
    .radio label { cursor: pointer; }
    .button { font: inherit; font-size: 19px; font-weight: 400; color: #fff; background: var(--button); border: 2px solid transparent;
              border-radius: 0; box-shadow: 0 2px 0 var(--button-shadow); padding: 8px 10px 7px; cursor: pointer; }
    .button:hover { background: #005a30; }
    .button:focus { outline: 3px solid transparent; background: var(--focus); color: var(--text); box-shadow: 0 2px 0 var(--text); }
    .panel { background: var(--panel); color: #fff; padding: 30px; text-align: center; margin-bottom: 30px; }
    .panel p { margin: 0; }
    .panel-caption { font-size: 24px; }
    .panel-rate { font-size: 64px; font-weight: 700; line-height: 1.1; margin: 10px 0 !important; }
    .panel-rule { font-size: 19px; }
    .tag { display: inline-block; background: #fff; color: var(--panel); font-weight: 700; padding: 1px 8px; margin-left: 8px; letter-spacing: 1px; }
    .error-summary { border: 5px solid var(--error); padding: 20px; margin-bottom: 30px; }
    .error-title { margin: 0 0 15px; font-size: 24px; }
    .error-summary p { margin: 0 0 5px; color: var(--error); font-weight: 700; }
    .error-summary .code { color: var(--secondary); font-weight: 400; font-size: 16px; }
    .aside { border-top: 2px solid var(--brand); padding-top: 15px; font-size: 16px; color: var(--secondary); }
    .aside h2 { font-size: 19px; color: var(--text); margin: 0 0 10px; }
    footer { border-top: 1px solid var(--border); background: #f3f2f1; }
    footer .inner { max-width: 960px; margin: 0 auto; padding: 25px 30px; font-size: 16px; color: var(--secondary); }
  </style>
</head>
<body>
  <header class="header"><div class="header-inner">UK Government Demo Service</div></header>
  <div class="banner"><div class="banner-inner"><span class="phase">Demo</span>This is a demonstration service. It is not a real government service and the rates are invented.</div></div>
  <main>
    <div class="layout">
      <div>
        <h1>Check your vehicle tax rate</h1>
        <p class="lede">Find out how much vehicle tax a vehicle pays for a year.</p>
        ${outcome}
        <form method="post" action="/" novalidate>
          ${fields}
          <button class="button" type="submit">Calculate</button>
        </form>
      </div>
      <aside class="aside">
        <h2>About this service</h2>
        <p>This service replaces the vehicle tax rate enquiry previously available only to contact centre staff.</p>
      </aside>
    </div>
  </main>
  <footer><div class="inner">UK Government Demo Service. Fictional, for demonstration only.</div></footer>
</body>
</html>`;
}

const server = createServer((req, res) => {
  if (req.method === "POST" && req.url === "/") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; if (body.length > 10000) req.destroy(); });
    req.on("end", () => {
      const { typed, vehicle } = readForm(body);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(page(typed, rateVehicle(vehicle)));
    });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url?.startsWith("/?"))) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page({}, null));
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Page not found");
});

server.listen(PORT, () => {
  console.log(`Vehicle tax rate enquiry running at http://localhost:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
