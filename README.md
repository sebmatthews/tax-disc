# Tax Disc

A live demo of AI-augmented code modernisation. A legacy COBOL (Common Business-Oriented Language) system with a green screen terminal interface is modernised by a coding agent into a TypeScript web application running on Node, working from the COBOL alone, and the two versions are checked against each other.

The service is fictional: a vehicle tax rate enquiry, badged only as 'UK Government Demo Service'. It is not a real government service, it uses no real department, crown or GOV.UK logo, and its rates and rules are invented.

## Running The Demo

Set up the Mac with `docs/install-guide.md`, then follow the script in `docs/demo-guide.md`. Everything is driven by the demo command:

| Command | What it does |
| --- | --- |
| `./demo.sh check` | Checks this Mac is ready. |
| `./demo.sh start` | Gets to the starting point before a demo. |
| `./demo.sh old` | Opens the green screen (the before). |
| `./demo.sh verify` | Runs the matching check, once the agent has finished. |
| `./demo.sh new` | Opens the new web page (the after). |
| `./demo.sh backup` | Puts a finished, checked version in place if a live run fails. |
| `./demo.sh finish` | Keeps the run's work and resets after a demo. |

To set up your own independent copy of the demo, follow `docs/handoff-guide.md`.

## What Is Here

| Path | Holds |
| --- | --- |
| `legacy/` | The legacy system, in COBOL: `VEDENQ` (green screen), `VEDBATCH` (batch run), `VEDCALC` (the rating rules, called by both), and `build.sh`. |
| `test/vehicles.dat` | 300 test vehicles. |
| `test/expected.dat` | The legacy system's recorded answers for them. |
| `check.sh` | The matching check: rates every test vehicle through the old and new systems and reports whether every answer matches. |
| `tools/compare.mjs` | Compares the two systems' answers; used by `check.sh`. |
| `prompts/modernise.md` | The work item for the coding agent, written as a user story. |
| `demo.sh` | The demo command. |
| `AGENTS.md` | Standing notes for any coding agent. |
| `docs/demo-guide.md` | The script for presenters. |
| `docs/install-guide.md` | Setting up a presenter's Mac. |
| `docs/matching-check.md` | How the matching check works, and what it does not cover. |
| `docs/admin-guide.md` | The demo owner's occasional steps: branches, the fallback, changing the test vehicles, the handoff. |
| `docs/handoff-guide.md` | Setting up an independent copy of the demo. |

The modern version is built live in the demo, into `modern/`. A finished version, for use if a live run fails, is kept on the `backup/modern` branch, never on `main`.

## Copyright and Licence

Copyright © 2026 the copyright holder. All rights reserved, except as granted below.

The copyright holder grants Cosine, and its employees, contractors and agents, a perpetual, irrevocable, worldwide, royalty-free, non-exclusive licence to use, run, copy, modify, adapt, distribute, sublicense and otherwise exploit this demo and everything in it, including for commercial purposes, without restriction and without any obligation to the copyright holder. The demo is provided as is, without warranty of any kind.
