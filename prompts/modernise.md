# User Story: Vehicle Tax Rate Enquiry On The Web

As a motorist, I want to check the annual vehicle tax rate for my vehicle in a web browser, so that I no longer have to phone the contact centre, whose staff look it up on the green screen.

## Background

The rate enquiry runs today as a COBOL system in `legacy/`: a green screen used by contact centre staff (`VEDENQ`), a batch run (`VEDBATCH`), and the rating rules both of them call (`VEDCALC`). The team who wrote it have gone. There is no other documentation: the COBOL is the specification.

The organisation wants the same service on the web, built in TypeScript on Node, so that it can be maintained by today's developers. This is a like-for-like move. The rules must not change, not even where they look odd.

## Acceptance Criteria

1. Same answers. For every vehicle in `test/vehicles.dat`, the new service gives exactly the same rate and rule code as the legacy batch run, as recorded in `test/expected.dat`. `sh check.sh` proves this, and must report every vehicle matching.

2. Same quirks. Behaviour that looks like a bug in the legacy code is kept, not fixed. The legacy team warned that the way the system reads dates, and the way it treats fields left blank, have caught people out before.

3. A batch run. `node modern/batch.ts <input-file> <output-file>` reads and writes the same record layouts as `legacy/VEDBATCH`, line for line, so the two outputs can be compared directly.

4. A web page. `node modern/server.ts` serves the enquiry at http://localhost:3000. The page asks for the same eight things as the green screen, in the same order, and after the user presses 'Calculate' it shows the annual rate in pounds, the rule applied with its description, and any error message, as the green screen does. What a user types is read the same way the green screen reads it.

5. A modern government look, unbranded. The page must look like a modern UK government service, because the people who use it expect that. The service owner has fixed the design:

   - Text in Arial (falling back to Helvetica, then any sans serif), 19px body text, near-black text (#0b0c0c) on white. Content in a single centred column no wider than 960px, which works at phone width too.
   - A header bar across the full width: near-black (#0b0c0c), with a 10px blue (#1d70b8) strip along its bottom edge, and 'UK Government Demo Service' in bold white text.
   - Directly under the header, a phase banner across the full width: white, with a thin grey line beneath it, holding a small blue (#1d70b8) tag reading 'DEMO' in white capitals, followed by 'This is a demonstration service. It is not a real government service and the rates are invented.'
   - The page heading 'Check your vehicle tax rate', large and bold, then a short introductory sentence in larger text.
   - To the right of the main column on wide screens (below it on narrow ones), a side panel headed 'About this service', topped with a blue line, saying that the service replaces the rate enquiry previously available only to contact centre staff.
   - The eight questions as a single form, one under another, each with a bold label and, where useful, a grey hint beneath. Text boxes have 2px near-black borders and are sized to the length of answer expected. Fuel type is a set of radio buttons (Petrol, Diesel, Electric) and first licence is a pair (Yes, No). A green (#00703c) 'Calculate' button at the end.
   - After 'Calculate', the answer appears above the form, so it is the first thing seen: a green (#00703c) panel with white text, the annual rate in very large bold figures with a pound sign, and beneath it the description of the rule applied with its rule code. An error appears in the same place instead: a box with a thick red (#d4351c) border, headed 'There is a problem', with the message in red. The form keeps what was entered, with numbers shown in full, as the green screen shows them.
   - A light grey (#f3f2f1) footer reading 'UK Government Demo Service. Fictional, for demonstration only.'
   - Keyboard focus shown with a yellow (#ffdd00) outline.

   It must not use the crown, the GOV.UK logo or the GDS Transport typeface. Write the styling by hand.

## Constraints

Everything new goes in `modern/`. Do not change anything in `legacy/`, `test/`, `prompts/`, `tools/`, `docs/`, `check.sh`, `demo.sh` or `AGENTS.md`.

Node runs the TypeScript directly, with no build step. Use only Node's built-in modules: no npm packages, no `package.json` dependencies, nothing to install. Write imports with their `.ts` extensions, import types with `import type`, and avoid TypeScript features Node cannot run directly: enums, namespaces with code, parameter properties, import aliases and decorators.

## Done Means

`sh check.sh` reports every vehicle matching, and the web page gives the same answer as the green screen for any vehicle typed into both.
