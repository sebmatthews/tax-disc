# Tax Disc Handoff Guide

This guide sets up a complete, independent copy of the Tax Disc demo under your own GitHub account, and then runs it. The demo comes to you as two zip files: the repository, and a finished modern version used as a fallback. Your copy starts from them, with a history of its own, and nothing in it depends on, or connects to, anywhere else. Follow Parts 1 to 8 in order. Each ends with a check, so you know it worked before you move on.

## Licence

Copyright © 2026 the copyright holder. All rights reserved, except as granted below.

The copyright holder grants Cosine, and its employees, contractors and agents, a perpetual, irrevocable, worldwide, royalty-free, non-exclusive licence to use, run, copy, modify, adapt, distribute, sublicense and otherwise exploit this demo and everything in it, including for commercial purposes, without restriction and without any obligation to the copyright holder. The demo is provided as is, without warranty of any kind.

The same statement is in the repository's README.

## What the Demo Is

Tax Disc is a short live demo, of around five to twelve minutes depending on how long Cosine takes, of an AI coding agent, Cosine, modernising a legacy government system. The system is a fictional vehicle tax rate enquiry, badged only 'UK Government Demo Service', with invented rates. It is written in COBOL (Common Business-Oriented Language) and runs as a green-on-black terminal screen.

On stage, the presenter shows the green screen, then points Cosine at a user story. Cosine reads the COBOL, with no written description of the rules, and rebuilds the service as a web page in TypeScript, the typed form of JavaScript, running on Node. A matching check then runs 300 test vehicles through the old and new systems and proves every answer matches, and the presenter shows the same answers on the new page.

How the proof works: the old system's answers for the 300 test vehicles are recorded in the repository. The check runs the old system again, confirms it still gives those answers, runs the new system, and compares every answer. Any difference fails the check and names the vehicles.

## How the Pieces Fit

- Your GitHub repository holds the old system, the test vehicles and their recorded answers, the matching check, the user story Cosine works from, the demo command and the guides. Its `main` branch is what Cosine starts from, and never contains a modern version.
- A second branch, `backup/modern`, holds the finished modern version. The demo command fetches it only if a live run fails, and removes every trace of it when the run is finished, so Cosine never sees it.
- After each run, the demo command copies the run's work to `~/tax-disc-runs` on the presenter's Mac and resets the demo folder to exactly what is on GitHub, so no run can find an earlier one's work.
- Everything runs on the presenter's Mac: the old system through GnuCOBOL, the new one through Node. No cloud service and no Windows machine is involved.
- The demo command, `./demo.sh`, is all a presenter types, apart from one line typed into Cosine.

## What You Need

- A GitHub account, or an organisation you can create repositories in.
- A Mac with an Apple silicon chip (M1 or later). Part 1 sets it up.
- Cosine CLI, with an account to sign in with, and the model you intend to present with.
- The two zip files you were given, called REPO_ZIP and FALLBACK_ZIP in this guide. REPO_ZIP contains the whole repository, with no history. FALLBACK_ZIP contains only a `modern` folder.
- About half an hour.

Throughout, replace words in capitals, such as YOUR_ACCOUNT, with your own values. Commands are typed or pasted into the Terminal app exactly as shown.

## Part 1: Set Up Your Mac

1. Follow steps 1 to 4 of the install guide, `docs/install-guide.md` inside REPO_ZIP: Homebrew, then GnuCOBOL, Node and Git, then Cosine, then Git's name and email. For this Mac, which will push to GitHub, use the private 'noreply' address shown in GitHub under Settings, then Emails; it looks like `12345678+yourname@users.noreply.github.com`. If you use your own email instead, and GitHub is set to block command line pushes that expose it, GitHub refuses your pushes.
2. Install GitHub's command line tool and sign in:

        brew install gh
        gh auth login

   Choose GitHub.com, then HTTPS, then yes to 'Authenticate Git with your GitHub credentials?', then 'Login with a web browser'. Press Enter to open the browser and paste the one-time code shown.

Check: `git --version`, `cobc --version`, `node --version`, `gh auth status` and `cos --version` each answer without an error.

## Part 2: Make Your Own Copy

This makes a new repository whose history starts with a single fresh commit of REPO_ZIP's contents. Your own copy lives in a folder of its own, `~/tax-disc-owner`, kept apart from the copy the demo runs in, because your copy will hold the fallback branch, which Cosine must never see.

1. In GitHub, select the + menu at the top right, then New repository. Choose your account or organisation as the owner, name it `tax-disc`, and choose Public or Private (see the note below). Leave it empty: no README, no .gitignore, no licence. Select Create repository.
2. On your Mac, in Terminal:

        mkdir ~/tax-disc-owner
        cd ~/tax-disc-owner
        unzip PATH_TO_REPO_ZIP
        cd tax-disc
        chmod +x demo.sh
        git init -b main
        git add -A
        git commit -m "Tax Disc demo"
        git remote add origin https://github.com/YOUR_ACCOUNT/tax-disc.git
        git push -u origin main

   For PATH_TO_REPO_ZIP, you can type `unzip ` with a space and then drag REPO_ZIP from Finder into the Terminal window. `chmod +x demo.sh` makes sure the demo command can be run; Git records that, so everyone who downloads your repository gets it.

Public or private: either works. In a public repository, anyone can read the code, but presenters need no GitHub account. In a private repository, each presenter needs a GitHub account with access (Part 5), and signs in, as the install guide describes.

Check: your repository on GitHub shows the files, including `demo.sh` and `legacy`, and has no `modern` folder.

## Part 3: Add the Fallback

The fallback is a finished modern version, built to the same user story, that passes the matching check. It goes on its own branch, so it is never in the copy Cosine works in.

In Terminal, still in `~/tax-disc-owner/tax-disc`:

    git switch -c backup/modern
    unzip PATH_TO_FALLBACK_ZIP
    sh check.sh

The check should end with 'MATCH. All 300 vehicles get the same answer from the old and new systems.' If it does:

    git add modern
    git commit -m "Finished modern version, fallback for a failed live run"
    git push -u origin backup/modern
    git switch main

Check: on GitHub, your repository has two branches, `main` and `backup/modern`; the `modern` folder appears only on `backup/modern`. Back on your Mac, `ls` in `~/tax-disc-owner/tax-disc` shows no `modern` folder.

## Part 4: Check A Presenter's Copy

Presenters download only `main`, with no history and no other branches, so Cosine cannot see the fallback. Do this once on your own Mac now, to prove it works; presenters do the same in Part 5.

Follow steps 5 and 6 of the install guide, replacing OWNER with YOUR_ACCOUNT:

    git clone --depth 1 --single-branch --branch main https://github.com/YOUR_ACCOUNT/tax-disc.git ~/tax-disc
    cd ~/tax-disc
    ./demo.sh check

Check: `./demo.sh check` ends with 'This Mac is ready.'

Never run the demo in `~/tax-disc-owner`, and never download the demo for a presenter with a plain `git clone`: both would let Cosine find the fallback.

## Part 5: Add Presenters

If your repository is public, presenters need nothing from you but the install guide.

If it is private: give each presenter access. In a repository owned by an organisation, give them the Read role; presenters never push. In a repository owned by a personal account, GitHub only allows collaborators write access: in the repository, open Settings, then Collaborators, select Add people, and enter each presenter's GitHub username. Either way, they must accept the invitation, which expires after seven days.

Each presenter then follows the install guide, steps 1 to 6.

Check: on each presenter's Mac, `./demo.sh check` ends with 'This Mac is ready.'

## Part 6: The Demo Command

Run from Terminal in `~/tax-disc`.

| Command | When | What it does |
| --- | --- | --- |
| `./demo.sh check` | Once, after setting up the Mac | Checks Git and your name, GnuCOBOL, Node, Cosine, that the demo can be reached on GitHub, and that the green screen builds. |
| `./demo.sh start` | Before each demo or rehearsal | Copies anything left in the folder to `~/tax-disc-runs`, resets the folder to exactly `main` as it is on GitHub, with no other branches or earlier work, starts a fresh branch for this run and builds the green screen. Ends by printing the line to type into Cosine. |
| `./demo.sh old` | The before | Opens the green screen. Escape leaves it. |
| `./demo.sh verify` | When Cosine has finished | Runs the matching check. |
| `./demo.sh new` | The after | Starts the new web page and opens it in the browser. Ctrl+C stops it. |
| `./demo.sh backup` | If the live run fails | Fetches the fallback from GitHub, copies Cosine's work to `~/tax-disc-runs`, puts the fallback in place and runs the matching check, stopping if it does not match. |
| `./demo.sh finish` | After each demo or rehearsal | Copies this run's work to `~/tax-disc-runs` (unless the fallback was in use) and resets the folder to exactly `main` as it is on GitHub. |

Work is never lost: it is copied to `~/tax-disc-runs` before the folder is reset. That folder sits outside the demo folder, where the agent works; delete old runs from it when you like.

## Part 7: Rehearse

1. On a presenter's Mac, in `~/tax-disc`: `./demo.sh start`.
2. If your Cosine set-up keeps memories between sessions, clear them, so every run starts the same.
3. Start Cosine in the same folder with `cos`, and type exactly:

        Work through the user story in prompts/modernise.md.

4. When Cosine has finished: `./demo.sh verify`, then `./demo.sh new`, and key a vehicle into the page.
5. `./demo.sh finish`.

Record each result: MATCH or NO MATCH, and how long Cosine took. Rehearse with the model you will present with; results with one model say little about another. For reference, the demo was run on 6 October 2026 with Cosine's Outpost model: it passed the matching check, in about seven minutes.

## Part 8: Run the Demo

The full script, with what to show and say in each part, is `docs/demo-guide.md`. In short:

1. About ten minutes before: `./demo.sh start`.
2. The before: `./demo.sh old`, two vehicles, and a look at the COBOL.
3. The change: show the user story, start Cosine and type the line above.
4. The after: `./demo.sh verify`, then `./demo.sh new`, and the same two vehicles.
5. If the check fails, or Cosine gives up: `./demo.sh backup`, then `./demo.sh new`. Never debug live.
6. Afterwards: `./demo.sh finish`.

## Keep It Right

- `main` must never contain a modern version, or anything that describes the rules in words. The demo depends on Cosine finding the rules in the COBOL.
- The recorded answers in `test/expected.dat` are the standard everything is judged by. If you ever change the old system or the test vehicles, record the answers again from the old system, in `~/tax-disc-owner/tax-disc` on `main`: `sh legacy/build.sh`, then `./legacy/vedbatch test/vehicles.dat test/expected.dat`. Commit and push, then bring the fallback up to date (next point).
- After any change to `main`, bring it into the fallback and check it: `git switch backup/modern`, `git merge main --no-edit`, `sh check.sh`. If it says MATCH, `git push`, then `git switch main`. If not, fix the fallback before pushing.
- Nothing from a run is ever sent to GitHub. Each run's work is in `~/tax-disc-runs` on the presenter's Mac.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| The push in Part 2 is refused | Run `gh auth login` again; if it asks whether to sign in to Git with your GitHub credentials, answer yes (Part 1, step 2). |
| GitHub refuses a push, mentioning a private email | Use your GitHub noreply address (Part 1, step 1), then amend the commit with `git commit --amend --reset-author --no-edit` and push again. |
| `zsh: permission denied: ./demo.sh` | Run `chmod +x demo.sh` in your own copy, then commit and push the change, so presenters get it. |
| `./demo.sh check` says the demo cannot be reached on GitHub | Check the internet connection. If the repository is private, check the presenter has accepted the invitation and signed in (Part 5). |
| `./demo.sh check` says Node is too old | `brew upgrade node`. Node must be 22.18 or later to run TypeScript directly. |
| `./demo.sh start` stops, saying a modern folder is still here | Download again: `cd ~`, then `rm -rf ~/tax-disc`, then the download command in Part 4. |
| `./demo.sh backup` cannot fetch the fallback | Check the internet connection, and that `backup/modern` exists on GitHub (Part 3). |
| `./demo.sh verify` says the old system no longer gives its recorded answers | The old system or the test vehicles have been changed. Download the demo again; if it persists, see Keep It Right. |
| `./demo.sh verify` says NO MATCH | Cosine's version got a rule wrong. This is a real result, not a fault in the demo: use the fallback, and count it as a failed rehearsal. |

## What Is in the Repository

- `legacy`: the old system in COBOL. `VEDENQ` is the green screen, `VEDBATCH` the batch run, `VEDCALC` the rating rules both call; `build.sh` builds them.
- `test`: the 300 test vehicles and the old system's recorded answers.
- `check.sh` and `tools/compare.mjs`: the matching check.
- `prompts/modernise.md`: the user story Cosine works from.
- `demo.sh`: the demo command.
- `AGENTS.md`: standing notes that Cosine reads in this repository, including what it must not change.
- `docs`: the demo guide (the script), the install guide for presenters, the admin guide, the matching check explained, and this guide.

Everything in the service is fictional: no real department, no crown, no GOV.UK logo, and invented rates, with a banner on the new page saying so. Keep it that way, so the demo can never be mistaken for a real government service.
