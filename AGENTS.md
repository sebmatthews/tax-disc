# Vehicle Tax Rate Enquiry: Notes For Coding Agents

This repository holds a fictional government service, a vehicle tax rate enquiry, badged 'UK Government Demo Service'. It is not a real service and its rates are invented.

## Layout

`legacy/` is the existing system, in COBOL, built with GnuCOBOL by `legacy/build.sh`: `VEDENQ` (green screen), `VEDBATCH` (batch run) and `VEDCALC` (the rating rules, called by both).

`test/vehicles.dat` holds the test vehicles and `test/expected.dat` the legacy system's recorded answers for them.

`check.sh` compares the legacy system's answers with the new system's. `demo.sh` is the demo command presenters use.

`prompts/` holds the work items.

`docs/` holds guides for the people who run the demo.

## Always

Keep changes to what the work item asks for.

Treat the legacy code's behaviour as correct, including behaviour that looks odd.

## Never Change

Anything in `legacy/`, `test/`, `prompts/`, `tools/` or `docs/`, or `check.sh`, `demo.sh` or this file, unless the work item explicitly says so.
