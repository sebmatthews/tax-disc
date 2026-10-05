# Tax Disc

A live demo of AI-augmented code modernisation. A legacy COBOL (Common Business-Oriented Language) system with a green screen terminal interface is modernised by a coding agent into a TypeScript web application running on Node, working from the COBOL alone, and the two versions are checked against each other.

The service is fictional: a vehicle tax rate enquiry, badged only as 'UK Government Demo Service'. It is not a real government service, it uses no real department, crown or GOV.UK logo, and its rates and rules are invented.

## Status

Under construction. The legacy system, the test vehicles, the matching check and the work item for the coding agent exist; the demo command and the demo guide do not yet.

## What Is Here

| Path | Holds |
| --- | --- |
| `legacy/` | The legacy system, in COBOL: `VEDENQ` (green screen), `VEDBATCH` (batch run), `VEDCALC` (the rating rules, called by both), and `build.sh`. |
| `test/vehicles.dat` | 300 test vehicles. |
| `test/expected.dat` | The legacy system's recorded answers for them. |
| `check.sh` | The matching check: rates every test vehicle through the old and new systems and reports whether every answer matches. |
| `tools/compare.mjs` | Compares the two systems' answers; used by `check.sh`. |
| `prompts/modernise.md` | The work item for the coding agent, written as a user story. |
| `AGENTS.md` | Standing notes for any coding agent. |
| `docs/install-guide.md` | Setting up a presenter's Mac. |
| `docs/matching-check.md` | How the matching check works, and what it does not cover. |
| `docs/admin-guide.md` | The demo owner's occasional steps: branches, the backup, changing the test vehicles. |

The modern version is built live in the demo, into `modern/`. A finished version, for use if a live run fails, is kept on the `backup/modern` branch.

## Running The Legacy System

Needs a Mac with Homebrew. From the repository folder:

```
brew install gnucobol node
sh legacy/build.sh
./legacy/vedenq
```

On the green screen, Tab moves between fields, Enter calculates, Escape exits.

## Running The Matching Check

Once `modern/` exists:

```
sh check.sh
```

## Running The Modern Version

```
node modern/server.ts
```

Then open http://localhost:3000.

## Copyright

Copyright 2026 Seb Matthews. All rights reserved. No licence is granted by the publication of this repository.
