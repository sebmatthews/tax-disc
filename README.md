# Tax Disc

A live demo of AI-augmented code modernisation. A legacy COBOL (Common Business-Oriented Language) program with a green screen terminal interface is modernised by a coding agent into a TypeScript web application running on Node, with the same business rules, and the two versions are checked against each other.

The service is fictional: a vehicle tax rate enquiry, badged only as 'UK Government Demo Service'. It is not a real government service, it uses no real department, crown or GOV.UK logo, and its rates and rules are invented.

## Status

Early build. The `spike/` folder holds the green screen test program.

## Running The Green Screen Test

Needs a Mac with Homebrew. From the repository folder:

```
brew install gnucobol
cobc -x spike/VEDENQ.cbl -o spike/vedenq
./spike/vedenq
```

Tab moves between fields, Enter calculates, Escape exits.

## Copyright

Copyright 2026 Seb Matthews. All rights reserved. No licence is granted by the publication of this repository.
