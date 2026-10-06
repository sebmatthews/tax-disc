# Demo Guide

Status: draft, 6 October 2026. The script for presenters: what to show and say, in order, and what to do if something goes wrong. Set up the Mac first with the install guide.

## The Story In One Breath

A government service still runs on COBOL, behind a green screen only contact centre staff can use. The people who wrote it have gone, and the code is the only description of the rules. An AI coding agent reads the COBOL and rebuilds the service as a modern web page, without being told the rules. Then a check runs 300 vehicles through the old and new systems and proves every answer matches.

## Before You Start

About ten minutes before:

1. Open Terminal, go into the demo with `cd ~/tax-disc`, and run `./demo.sh start`. It copies anything an earlier run left to `~/tax-disc-runs`, resets the folder to exactly what is on GitHub, so nothing from an earlier run is left for the agent to find, starts a fresh branch for this run and builds the green screen.
2. If your Cosine set-up keeps memories between sessions, clear them, so this run starts the same as every rehearsal.
3. Make Terminal's text large enough for the back of the room (Command and plus), and the window wide enough that the green screen sits in the middle with space around it.
4. Have a browser open, and a second Terminal window, also in `~/tax-disc`, for Cosine.

Check: `./demo.sh start` ended with 'Ready', and printed the line to type into Cosine.

## Running Order

Times are a guide. The middle part takes as long as Cosine takes: a few minutes with a strong model, about seven with Cosine's Outpost model.

| Part | About | What the audience sees |
| --- | --- | --- |
| The before | 1 to 2 minutes | The green screen, two vehicles keyed in, a glance at the COBOL |
| The change | As long as Cosine takes | The user story, then Cosine reading the COBOL and writing the new system |
| The after | 2 minutes | The matching check, then the new web page giving the same answers |
| Close | 1 minute | What this means for a real legacy estate |

## The Before

Show: run `./demo.sh old`. The green screen appears.

Key in a vehicle. Tab moves between fields; Enter calculates.

| Green screen field | Vehicle 1 | Vehicle 2 |
| --- | --- | --- |
| Registration mark | AB12CDE | CD23EFG |
| Date of first registration | 010612 | 010323 |
| Fuel type | D | P |
| CO2 emissions | 145 | 120 |
| Engine size | (leave blank) | (leave blank) |
| List price | (leave blank) | 045000 |
| First licence | N | N |
| Licence start date | 011026 | 011026 |
| Answer | £220, rule B4 | £620, rule STDS |

To key the second vehicle, Tab back to each field and type over it, using every digit, so nothing is left over from the first.

Say: this is a vehicle tax rate enquiry, the kind of system still running in government, banks and insurers. Only contact centre staff can use it. It is written in COBOL, a language from the 1960s. The people who wrote it have gone, and nobody has written the rules down: the code is the only specification.

Press Escape to leave the green screen. Then show the code: open `legacy/VEDCALC.cbl` in any text viewer, for example with `open -e legacy/VEDCALC.cbl`, and scroll through it.

Say: this is where the rules live. Bands, dates, exemptions, buried in code like this. Modernising means getting every one of them right, including the odd ones.

## The Change

Show the user story first: open `prompts/modernise.md`, for example with `open -e prompts/modernise.md`.

Say: this is how a real team hands work over: as a user story, with acceptance criteria. A motorist wants to check their rate on the web. Look at what it does and does not contain. It says what to build, how it must look, and how we will know it is right. It does not contain a single tax rule. The agent has to find those in the COBOL. The acceptance criteria are what make the result checkable: every answer must match the old system.

Show: in the second Terminal window, start Cosine with `cos`, and type exactly the line `./demo.sh start` printed:

    Work through the user story in prompts/modernise.md.

While Cosine works, let the audience watch it read the COBOL and write files. Talking points:

- It is reading the old code, not a specification. That is the hard part of real modernisation.
- It is writing TypeScript, a mainstream language today's developers know.
- Everything it writes is ordinary code in a folder, which a team can review, change and own.
- When it finishes, we do not take its word for it. We check.

Never type anything to Cosine except the line above, and never debug live.

## The After

When Cosine says it has finished, in the first Terminal window:

    ./demo.sh verify

Say: this runs 300 test vehicles through the old COBOL system and the new one, and compares every answer. They were chosen to hit every rule and every awkward edge.

It ends with 'MATCH. All 300 vehicles get the same answer from the old and new systems.'

Then:

    ./demo.sh new

The new web page opens in the browser. Key in the same two vehicles as on the green screen. The labels are worded for the public ('Registration number', 'Is this the vehicle's first licence?'), and fuel type and first licence are buttons here. The same answers appear: £220 and £620.

Say: same service, same rules, same answers, and now on the web, where anyone can use it.

If there is time, show a quirk that was kept. On both the green screen and the web page, key in a car first registered in 1949: date of first registration 010649, licence start 011026, petrol, first licence N. Both refuse it, saying the first registration is after the licence start. The old system reads 49 as 2049. The new one does the same, because a like-for-like move keeps the old behaviour, quirks included. Fixing it is a separate, deliberate change.

## Close

Say: the old system was never changed. The agent worked from the code alone, and the check proved the result, so nobody has to take the rewrite on trust. The same approach scales to a real estate: one service at a time, each proved against the old system before it replaces it.

## Afterwards

Press Ctrl+C in the window running the web page. Then:

    ./demo.sh finish

It copies this run's work to `~/tax-disc-runs`, outside the demo folder, then resets the folder to exactly what is on GitHub, ready for the next `./demo.sh start`.

## If Something Goes Wrong

| What happens | What to do |
| --- | --- |
| `./demo.sh verify` says NO MATCH | Say: this is the safety net doing its job; the agent got a rule wrong, and the check caught it before any customer did. Then run `./demo.sh backup`, which puts a finished, checked version in place and runs the check again (MATCH), and carry on with `./demo.sh new`. |
| Cosine gives up, stops with an error, or runs far over time | Stop Cosine (Ctrl+C in its window), say you will show a version run earlier, and run `./demo.sh backup`, then `./demo.sh new`. |
| `./demo.sh new` says something is already running the page | An earlier copy of the page is still running in another window. Press Ctrl+C there, then run `./demo.sh new` again. |
| The browser does not open | Open http://localhost:3000 in the browser yourself. |
| `./demo.sh start` stops, saying a modern folder is still here | Do not run the demo in this folder. Download it again: `cd ~`, then the delete and download commands in step 5 of the install guide. |
| Anything else | Use `./demo.sh backup`. Never debug live. |

`./demo.sh backup` never loses Cosine's work: it copies it to `~/tax-disc-runs` before putting the fallback in place. If the fallback itself does not match, it says so; then do not show it, and close.
