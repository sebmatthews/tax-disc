# Tax Disc

A live demo of AI-augmented code modernisation. A legacy COBOL (Common Business-Oriented Language) program with a green screen terminal interface is modernised by a coding agent into a TypeScript web application running on Node, with the same business rules, and the two versions are checked against each other.

The service is fictional: a vehicle tax rate enquiry, badged only as 'UK Government Demo Service'. It is not a real government service, it uses no real department, crown or GOV.UK logo, and its rates and rules are invented.

## Status

Early build. The legacy programs, the rules and the test vehicles exist; the modern version, the matching check and the demo command do not yet. `spike/` holds the first green screen test and is no longer used.

## What Is Here

| Path | Holds |
| --- | --- |
| `docs/rules.md` | The rules: inputs, dates, rates, errors, record layouts, the screen. Both versions are built to it. |
| `legacy/` | The legacy COBOL: `VEDENQ` (green screen), `VEDBATCH` (batch), `VEDCALC` (the rules, called by both), and `build.sh`. |
| `test/vehicles.dat` | 300 test vehicles, in the batch layout. |
| `test/expected.dat` | The legacy program's answers for them. The modern version must match these exactly. |
| `tools/make-vehicles.mjs` | Regenerates `test/vehicles.dat`, identically every time. |

## Running The Legacy Programs

Needs a Mac with Homebrew. From the repository folder:

```
brew install gnucobol
sh legacy/build.sh
./legacy/vedenq
```

On the green screen, Tab moves between fields, Enter calculates, Escape exits.

To rate the test vehicles in batch:

```
./legacy/vedbatch test/vehicles.dat test/legacy-run.dat
```

## Copyright

Copyright 2026 Seb Matthews. All rights reserved. No licence is granted by the publication of this repository.
