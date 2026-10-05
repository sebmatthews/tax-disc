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

5. A modern government look, unbranded. The page looks like a modern UK government service: plain, accessible, clear labels, one question area, a clear result. It is headed 'UK Government Demo Service' and carries a banner reading 'This is a demonstration service. It is not a real government service and the rates are invented.' It must not use the crown, the GOV.UK logo or the GDS Transport typeface. Write the styling by hand.

## Constraints

Everything new goes in `modern/`. Do not change anything in `legacy/`, `test/`, `prompts/`, `check.sh` or `AGENTS.md`.

Node runs the TypeScript directly, with no build step. Use only Node's built-in modules: no npm packages, no `package.json` dependencies, nothing to install. Write imports with their `.ts` extensions, and avoid TypeScript features Node cannot run directly: enums, namespaces with code, parameter properties and decorators.

## Done Means

`sh check.sh` reports every vehicle matching, and the web page gives the same answer as the green screen for any vehicle typed into both.
