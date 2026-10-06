// Port of legacy/VEDENQ.cbl: vehicle excise duty rate enquiry as a web page.
// Serves the same eight questions as the green screen, in the same order,
// and shows the annual rate, rule applied, and any error message.
// Listens on http://localhost:3000.

import { createServer } from "node:http";
import { calculateTax, getDescription } from "./vedcalc.ts";
import type { Vehicle } from "./vedcalc.ts";

const PAGE_HEAD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vehicle Excise Duty - Rate Enquiry</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
    padding: 0;
    background: #f3f2f1;
    color: #0b0c0c;
    line-height: 1.5;
  }
  .header {
    background: #0b0c0c;
    color: #ffffff;
    padding: 1em 0;
  }
  .header .inner { max-width: 960px; margin: 0 auto; padding: 0 1em; }
  .header h1 { font-size: 1.5rem; margin: 0; font-weight: bold; }
  .banner {
    background: #fd0;
    color: #0b0c0c;
    padding: 0.75em 0;
  }
  .banner .inner { max-width: 960px; margin: 0 auto; padding: 0 1em; }
  .banner p { margin: 0; font-weight: bold; }
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 2em 1em;
  }
  h2 { font-size: 1.75rem; margin-top: 0; }
  form {
    background: #ffffff;
    padding: 1.5em;
    border: 1px solid #b1b4b6;
  }
  .form-group { margin-bottom: 1.5em; }
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.25em;
  }
  .hint { display: block; font-weight: normal; color: #505a5f; margin-bottom: 0.25em; }
  input[type="text"], input[type="number"] {
    width: 100%;
    max-width: 20em;
    padding: 0.4em;
    border: 2px solid #0b0c0c;
    font-size: 1rem;
  }
  input:focus { outline: 3px solid #fd0; outline-offset: 0; }
  button {
    background: #00703c;
    color: #ffffff;
    border: none;
    padding: 0.6em 1.5em;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
  }
  button:hover { background: #005a30; }
  .result {
    background: #ffffff;
    border: 1px solid #b1b4b6;
    padding: 1.5em;
    margin-top: 2em;
  }
  .result h3 { margin-top: 0; font-size: 1.25rem; }
  .rate { font-size: 2rem; font-weight: bold; color: #00703c; }
  .rule { font-size: 1.1rem; margin: 0.5em 0; }
  .error { color: #d4351c; font-weight: bold; }
  .msg { margin-top: 1em; color: #505a5f; }
</style>
</head>
<body>
<div class="header"><div class="inner"><h1>UK Government Demo Service</h1></div></div>
<div class="banner"><div class="inner"><p>This is a demonstration service. It is not a real government service and the rates are invented.</p></div></div>
<main>
<h2>Vehicle Excise Duty &ndash; Rate Enquiry</h2>
`;

const PAGE_FORM = `
<form method="post" action="/">
  <div class="form-group">
    <label for="reg">Registration mark</label>
    <input type="text" id="reg" name="reg" maxlength="8" value="__REG__">
  </div>
  <div class="form-group">
    <label for="firstReg">Date of first registration</label>
    <span class="hint">DDMMYY, for example 010695</span>
    <input type="text" id="firstReg" name="firstReg" maxlength="6" value="__FIRSTREG__">
  </div>
  <div class="form-group">
    <label for="fuel">Fuel type</label>
    <span class="hint">P for petrol, D for diesel, E for electric</span>
    <input type="text" id="fuel" name="fuel" maxlength="1" value="__FUEL__">
  </div>
  <div class="form-group">
    <label for="co2">CO2 emissions (g/km)</label>
    <input type="text" id="co2" name="co2" maxlength="3" value="__CO2__">
  </div>
  <div class="form-group">
    <label for="engine">Engine size (cc)</label>
    <input type="text" id="engine" name="engine" maxlength="4" value="__ENGINE__">
  </div>
  <div class="form-group">
    <label for="price">List price (GBP)</label>
    <input type="text" id="price" name="price" maxlength="6" value="__PRICE__">
  </div>
  <div class="form-group">
    <label for="firstLic">First licence</label>
    <span class="hint">Y if this is the first licence for the vehicle, otherwise N</span>
    <input type="text" id="firstLic" name="firstLic" maxlength="1" value="__FIRSTLIC__">
  </div>
  <div class="form-group">
    <label for="licStart">Licence start date</label>
    <span class="hint">DDMMYY, for example 011026</span>
    <input type="text" id="licStart" name="licStart" maxlength="6" value="__LICSTART__">
  </div>
  <button type="submit">Calculate</button>
</form>
`;

const PAGE_RESULT_SUCCESS = `
<div class="result">
  <h3>Result</h3>
  <div class="rate">&pound;__RATE__</div>
  <div class="rule">Rule applied: <strong>__CODE__</strong> &mdash; __DESC__</div>
  <div class="msg">__MSG__</div>
</div>
`;

const PAGE_RESULT_ERROR = `
<div class="result">
  <h3>Result</h3>
  <div class="error">__MSG__</div>
</div>
`;

const PAGE_FOOT = `</main>\n</body>\n</html>`;

function htmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function parseScreenNumber(text: string): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return 0;
  return parseInt(trimmed, 10);
}

function renderPage(formValues: Record<string, string>, result: { rate: number; code: string; desc: string; msg: string } | null): string {
  let form = PAGE_FORM;
  for (const [key, value] of Object.entries(formValues)) {
    form = form.split(`__${key.toUpperCase()}__`).join(htmlEscape(value));
  }
  let resultHtml = "";
  if (result) {
    if (result.code.startsWith("E")) {
      resultHtml = PAGE_RESULT_ERROR.replace(/__MSG__/g, htmlEscape(result.msg));
    } else {
      resultHtml = PAGE_RESULT_SUCCESS
        .replace(/__RATE__/g, String(result.rate))
        .replace(/__CODE__/g, htmlEscape(result.code))
        .replace(/__DESC__/g, htmlEscape(result.desc))
        .replace(/__MSG__/g, htmlEscape(result.msg));
    }
  }
  return PAGE_HEAD + form + resultHtml + PAGE_FOOT;
}

const server = createServer((req, res) => {
  if (req.method === "GET") {
    const defaults: Record<string, string> = {
      reg: "", firstReg: "", fuel: "", co2: "", engine: "", price: "", firstLic: "", licStart: "",
    };
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(renderPage(defaults, null));
    return;
  }

  if (req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => { body += chunk; });
    req.on("end", () => {
      const params = new URLSearchParams(body);
      const reg = (params.get("reg") || "").slice(0, 8);
      const fuel = (params.get("fuel") || "").toUpperCase().slice(0, 1);
      const firstLic = (params.get("firstLic") || "").toUpperCase().slice(0, 1);

      const vehicle: Vehicle = {
        reg,
        firstReg: parseScreenNumber(params.get("firstReg") || ""),
        fuel,
        co2: parseScreenNumber(params.get("co2") || ""),
        engine: parseScreenNumber(params.get("engine") || ""),
        price: parseScreenNumber(params.get("price") || ""),
        firstLic,
        licStart: parseScreenNumber(params.get("licStart") || ""),
      };

      const calc = calculateTax(vehicle);
      const desc = getDescription(calc.code);
      let msg: string;
      if (calc.code.startsWith("E")) {
        msg = desc;
      } else {
        msg = "RATE CALCULATED FOR " + reg.trim();
      }

      const formValues: Record<string, string> = {
        reg,
        firstReg: String(vehicle.firstReg),
        fuel,
        co2: String(vehicle.co2),
        engine: String(vehicle.engine),
        price: String(vehicle.price),
        firstLic,
        licStart: String(vehicle.licStart),
      };

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage(formValues, { rate: calc.rate, code: calc.code, desc, msg }));
    });
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain" });
  res.end("Method Not Allowed");
});

server.listen(3000, () => {
  console.log("Vehicle tax rate enquiry listening on http://localhost:3000");
});
