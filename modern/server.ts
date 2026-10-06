// VEDENQ on the web - VEHICLE EXCISE DUTY RATE ENQUIRY
//
// Serves the rate enquiry at http://localhost:3000. A like-for-like
// port of legacy/VEDENQ.cbl: the page asks for the same eight things
// as the green screen, in the same order, and reads what is typed the
// same way. Calls the same rating rules as the batch run.
//
// UK GOVERNMENT DEMO SERVICE. FICTIONAL. RATES ARE INVENTED.

import { createServer } from "node:http";
import { calculateRate } from "./vedcalc.ts";
import type { Vehicle } from "./vedcalc.ts";

const PORT = 3000;

// Rule descriptions and error messages, as shown on the green screen.
function ruleDescription(code: string): string {
  switch (code) {
    case "HIST": return "Historic vehicle, exempt";
    case "ELEC": return "Electric, zero rate";
    case "ENG1": return "Pre 2001, up to 1549 cc";
    case "ENG2": return "Pre 2001, over 1549 cc";
    case "STD": return "Standard rate";
    case "STDS": return "Standard plus supplement";
    default:
      if (code[0] === "B") return `2001 to 2017, band ${code[1]}`;
      if (code[0] === "F") return `First licence, band ${code[1]}`;
      return "";
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  E01: "Invalid date of first registration",
  E02: "Invalid licence start date",
  E03: "First registration after licence start",
  E04: "Fuel type must be P, D or E",
  E05: "First licence must be Y or N",
};

// What the operator types is keyed as text and converted, so 95 in a
// three-digit field means 095, not 950. Blank or not a whole number is
// read as zero, as in the green screen's 2100-TO-NUMBER.
function parseKeyedNumber(typed: string, width: number): number {
  const trimmed = typed.trim();
  if (trimmed === "") return 0;
  if (!/^[0-9]+$/.test(trimmed)) return 0;
  // A wider number keeps only its low-order digits, as a COBOL move
  // into the fixed-width numeric field would.
  return Number(trimmed.slice(-width));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface FormState {
  reg: string;
  firstReg: string;
  fuel: string;
  co2: string;
  engine: string;
  price: string;
  firstLic: string;
  licStart: string;
}

const EMPTY_FORM: FormState = {
  reg: "",
  firstReg: "",
  fuel: "",
  co2: "",
  engine: "",
  price: "",
  firstLic: "",
  licStart: "",
};

interface Answer {
  kind: "rate" | "error";
  rate?: number;
  code?: string;
  description?: string;
  message?: string;
}

function textField(
  id: string,
  label: string,
  value: string,
  width: number,
  hint?: string,
): string {
  const hintHtml = hint
    ? `<div class="hint" id="${id}-hint">${hint}</div>`
    : "";
  const describedBy = hint ? ` aria-describedby="${id}-hint"` : "";
  return `
      <div class="form-group">
        <label class="label" for="${id}">${label}</label>
        ${hintHtml}
        <input class="input width-${width}" id="${id}" name="${id}" type="text" value="${escapeHtml(value)}"${describedBy}>
      </div>`;
}

function radioOption(
  name: string,
  value: string,
  label: string,
  checked: boolean,
): string {
  const isChecked = checked ? " checked" : "";
  return `
        <div class="radio">
          <input type="radio" id="${name}-${value}" name="${name}" value="${value}"${isChecked}>
          <label class="radio-label" for="${name}-${value}">${label}</label>
        </div>`;
}

function renderPage(form: FormState, answer: Answer | null): string {
  let answerHtml = "";
  if (answer && answer.kind === "rate") {
    const rateText = "£" + (answer.rate ?? 0).toLocaleString("en-GB");
    answerHtml = `
      <div class="result-panel">
        <h2 class="result-heading">Annual rate</h2>
        <p class="result-rate">${rateText}</p>
        <p class="result-rule">${escapeHtml(answer.description ?? "")} (${escapeHtml(answer.code ?? "")})</p>
      </div>`;
  } else if (answer && answer.kind === "error") {
    answerHtml = `
      <div class="error-box" role="alert">
        <h2 class="error-heading">There is a problem</h2>
        <p class="error-message">${escapeHtml(answer.message ?? "")}</p>
      </div>`;
  }

  const fuelRadios =
    radioOption("fuel", "P", "Petrol", form.fuel === "P") +
    radioOption("fuel", "D", "Diesel", form.fuel === "D") +
    radioOption("fuel", "E", "Electric", form.fuel === "E");
  const firstLicRadios =
    radioOption("firstLic", "Y", "Yes", form.firstLic === "Y") +
    radioOption("firstLic", "N", "No", form.firstLic === "N");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Check your vehicle tax rate - UK Government Demo Service</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 19px;
    line-height: 1.5;
    color: #0b0c0c;
    background: #ffffff;
  }
  .header {
    background: #0b0c0c;
    border-bottom: 10px solid #1d70b8;
  }
  .header-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 15px;
    color: #ffffff;
    font-weight: bold;
    font-size: 24px;
  }
  .phase-banner {
    background: #ffffff;
    border-bottom: 1px solid #b1b4b6;
  }
  .phase-banner-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 10px 15px;
    font-size: 16px;
  }
  .phase-tag {
    background: #1d70b8;
    color: #ffffff;
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 2px 8px;
    margin-right: 10px;
  }
  .content {
    max-width: 960px;
    margin: 0 auto;
    padding: 30px 15px 40px;
  }
  .layout {
    display: flex;
    gap: 40px;
    align-items: flex-start;
  }
  .main-column {
    flex: 1;
    min-width: 0;
  }
  .side-panel {
    width: 280px;
    flex-shrink: 0;
    border-top: 4px solid #1d70b8;
    padding-top: 10px;
  }
  .side-panel h2 {
    font-size: 19px;
    margin-top: 0;
  }
  @media (max-width: 768px) {
    .layout { flex-direction: column; }
    .side-panel { width: 100%; }
  }
  h1 {
    font-size: 36px;
    line-height: 1.2;
    margin: 0 0 15px;
  }
  .intro {
    font-size: 24px;
    margin: 0 0 30px;
  }
  .form-group {
    margin-bottom: 25px;
  }
  .label {
    display: block;
    font-weight: bold;
    margin-bottom: 4px;
  }
  .hint {
    color: #505a5f;
    margin-bottom: 6px;
  }
  .input {
    border: 2px solid #0b0c0c;
    padding: 5px 8px;
    font-family: inherit;
    font-size: 19px;
    max-width: 100%;
  }
  .width-8 { width: 10em; }
  .width-6 { width: 8em; }
  .width-4 { width: 6em; }
  .width-3 { width: 5em; }
  fieldset {
    border: 0;
    margin: 0 0 25px;
    padding: 0;
  }
  legend {
    font-weight: bold;
    padding: 0;
    margin-bottom: 4px;
  }
  .radio {
    display: block;
    margin: 8px 0;
  }
  .radio input {
    margin-right: 8px;
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }
  .radio-label {
    display: inline;
  }
  .calculate {
    background: #00703c;
    color: #ffffff;
    border: 0;
    padding: 10px 24px;
    font-family: inherit;
    font-size: 19px;
    font-weight: bold;
    cursor: pointer;
  }
  .calculate:hover {
    background: #005a30;
  }
  .result-panel {
    background: #00703c;
    color: #ffffff;
    padding: 25px 30px;
    margin-bottom: 30px;
  }
  .result-heading {
    font-size: 24px;
    margin: 0 0 10px;
  }
  .result-rate {
    font-size: 64px;
    font-weight: bold;
    line-height: 1.1;
    margin: 0 0 10px;
  }
  .result-rule {
    margin: 0;
  }
  .error-box {
    border: 4px solid #d4351c;
    padding: 20px 25px;
    margin-bottom: 30px;
  }
  .error-heading {
    font-size: 24px;
    margin: 0 0 10px;
  }
  .error-message {
    color: #d4351c;
    font-weight: bold;
    margin: 0;
  }
  :focus {
    outline: 3px solid #ffdd00;
    outline-offset: 0;
  }
  .footer {
    background: #f3f2f1;
  }
  .footer-inner {
    max-width: 960px;
    margin: 0 auto;
    padding: 20px 15px;
    font-size: 16px;
  }
</style>
</head>
<body>
<header class="header">
  <div class="header-inner">UK Government Demo Service</div>
</header>
<div class="phase-banner">
  <div class="phase-banner-inner">
    <span class="phase-tag">Demo</span>
    This is a demonstration service. It is not a real government service and the rates are invented.
  </div>
</div>
<main class="content">
  <div class="layout">
    <div class="main-column">
      <h1>Check your vehicle tax rate</h1>
      <p class="intro">Use this service to find the annual tax rate for a vehicle.</p>
      ${answerHtml}
      <form method="post" action="/">
        ${textField("reg", "Registration mark", form.reg, 8, "For example, AB12CDE")}
        ${textField("firstReg", "Date of first registration", form.firstReg, 6, "DDMMYY, for example 150324")}
        <fieldset>
          <legend>Fuel type</legend>
          ${fuelRadios}
        </fieldset>
        ${textField("co2", "CO2 emissions", form.co2, 3, "In grams per kilometre (g/km)")}
        ${textField("engine", "Engine size", form.engine, 4, "In cubic centimetres (cc), for example 1400")}
        ${textField("price", "List price", form.price, 6, "The list price when new, in whole pounds")}
        <fieldset>
          <legend>First licence</legend>
          <div class="hint">Select yes if this is the vehicle's first licence</div>
          ${firstLicRadios}
        </fieldset>
        ${textField("licStart", "Licence start date", form.licStart, 6, "DDMMYY, for example 011026")}
        <button class="calculate" type="submit">Calculate</button>
      </form>
    </div>
    <aside class="side-panel">
      <h2>About this service</h2>
      <p>This service replaces the vehicle tax rate enquiry previously available only to contact centre staff.</p>
    </aside>
  </div>
</main>
<footer class="footer">
  <div class="footer-inner">UK Government Demo Service. Fictional, for demonstration only.</div>
</footer>
</body>
</html>`;
}

// Reads the submitted form the way the green screen reads its fields,
// then calls the rating rules. Numbers are shown back in full, as the
// green screen shows them.
function handleEnquiry(params: URLSearchParams): { form: FormState; answer: Answer } {
  const reg = (params.get("reg") ?? "").slice(0, 8);
  const fuel = (params.get("fuel") ?? "").toUpperCase();
  const firstLic = (params.get("firstLic") ?? "").toUpperCase();

  const firstReg = parseKeyedNumber(params.get("firstReg") ?? "", 6);
  const co2 = parseKeyedNumber(params.get("co2") ?? "", 3);
  const engine = parseKeyedNumber(params.get("engine") ?? "", 4);
  const price = parseKeyedNumber(params.get("price") ?? "", 6);
  const licStart = parseKeyedNumber(params.get("licStart") ?? "", 6);

  const form: FormState = {
    reg,
    firstReg: String(firstReg).padStart(6, "0"),
    fuel,
    co2: String(co2).padStart(3, "0"),
    engine: String(engine).padStart(4, "0"),
    price: String(price).padStart(6, "0"),
    firstLic,
    licStart: String(licStart).padStart(6, "0"),
  };

  const vehicle: Vehicle = {
    reg,
    firstReg: form.firstReg,
    fuel,
    co2,
    engine,
    price,
    firstLic,
    licStart: form.licStart,
  };

  const result = calculateRate(vehicle);
  if (result.code[0] === "E" && result.code in ERROR_MESSAGES) {
    return {
      form,
      answer: { kind: "error", message: ERROR_MESSAGES[result.code] },
    };
  }
  return {
    form,
    answer: {
      kind: "rate",
      rate: result.rate,
      code: result.code,
      description: ruleDescription(result.code),
    },
  };
}

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const server = createServer((req, res) => {
  void (async () => {
    const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
    if (url.pathname !== "/") {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const params = new URLSearchParams(body);
      const { form, answer } = handleEnquiry(params);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(form, answer));
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage(EMPTY_FORM, null));
  })().catch(() => {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal server error");
  });
});

server.listen(PORT, () => {
  console.log(`Rate enquiry listening at http://localhost:${PORT}`);
});
