# The Matching Check

Status: draft, 5 October 2026. Explains how the demo proves the new system gives the same answers as the old one.

## What It Is

The matching check runs a set of test vehicles through the old system and the new one, and compares every answer. Nobody writes down what the system should do. The old system's own answers are the standard. This matters for legacy modernisation because the old system's behaviour, including its oddities, is what people depend on, and much of it is written down nowhere except in the code.

For the audience it is a clear promise: the system was rewritten in a modern language, and here is proof that it gives exactly the same answers as before.

## How It Works Here

`test/vehicles.dat` holds 300 test vehicles, one per line. They were chosen to exercise every rule in the old system, including the awkward edges, and then filled out with ordinary vehicles.

`test/expected.dat` holds the old system's answer for each vehicle: the annual rate and a code naming the rule that produced it. It was recorded by running the old system's batch program, and confirmed on a Mac with Homebrew's GnuCOBOL on 5 October 2026.

`sh check.sh` does three things:

1. Rebuilds the old system from its COBOL, runs its batch program over the test vehicles, and confirms it still gives its recorded answers. If it does not, the old system or the test vehicles have been changed, and the check stops: nothing can be compared until that is put right.
2. Runs the new system's batch program, `node modern/batch.ts`, over the same vehicles.
3. Compares the new system's answers with the recorded ones, line by line, and reports either MATCH, or NO MATCH with the first ten vehicles that differ, showing each vehicle and both answers.

Any difference, however small, is a failure.

## What It Proved In Testing

Two classic translation mistakes were planted in a copy of the new system on 5 October 2026 to prove the check catches them. Both were caught, and the check named the vehicles concerned. What the mistakes were is kept in the demo's working folder, not here, so as not to steer the agent.

## What It Does Not Cover

The check compares the batch programs. The web page and the green screen are compared by hand in the demo, by typing the same vehicle into both. Both are built on the same rules as the batch programs, but how each reads what is typed is not covered by the check.

It proves agreement on these 300 vehicles, not on every possible vehicle. A difference that none of the 300 exercises would get through. That is true of any test, and is a talking point: the test vehicles are only as good as the thought that went into choosing them.

## Running It

From the repository folder, once `modern/` exists:

    sh check.sh

It rebuilds the old system first, every time, so it always checks the COBOL as it is now.
