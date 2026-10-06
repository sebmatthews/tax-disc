# Admin Guide

Version 1.0, 6 October 2026. For the demo's owner: the occasional steps behind the demo, which presenters never do. Presenters follow the install guide and the demo guide. Setting up an independent copy of the demo is in the handoff guide.

## What Lives Where

The repository holds what presenters and the coding agent see: the old system, the test vehicles and their recorded answers, the matching check, the user story the agent works from, the demo command and these guides.

The demo depends on the agent working out the rules from the COBOL alone. Never add to the repository a written specification of the rules or a list of rates. The test vehicles and their answers, and the few example vehicles in the demo guide, are deliberate exceptions: the check needs the first, presenters need the second, and both only repeat what the COBOL and the test data already show.

## Branches

`main` is what the agent starts from. It must never have a `modern/` folder.

`backup/modern` holds a finished modern version, built to the same user story, for use if a live run fails. The demo command fetches it only when needed. It must always pass `sh check.sh`.

A full clone of the repository carries every branch, and the agent can read them all, including `backup/modern`. So presenters download `main` only, with no history and no other branches, as the install guide shows. Never tell presenters to run a plain `git clone`, and never run the demo in your own full copy.

`./demo.sh finish` copies each run's work to `~/tax-disc-runs` on the presenter's Mac, outside the demo folder, and resets the folder to exactly what is on GitHub, removing the run's branch. Nothing from a run is sent to GitHub. To keep a rehearsal for comparison, copy its folder from `~/tax-disc-runs`.

## Change The Old System Or The Test Vehicles

The recorded answers in `test/expected.dat` are the standard everything is judged by, so change them only on purpose, and only together with what caused them to change. In your own full copy, on `main`:

1. Make the change: to `legacy/`, or to `test/vehicles.dat`, one vehicle per line in the 35-character layout the batch program reads.
2. Rebuild the old system and record its answers again:

        sh legacy/build.sh
        ./legacy/vedbatch test/vehicles.dat test/expected.dat

3. Commit, push with `git push`, then bring the backup up to date (below).

## Bring The Backup Up To Date

After any change to `main`, bring it into the backup and check the backup still matches:

    git switch backup/modern
    git merge main --no-edit
    sh check.sh

If the check does not say MATCH, stop: do not push, and fix the backup first. If it does:

    git push
    git switch main

## Give A Presenter Access

If the repository is public, presenters need nothing from you but the install guide. If it is private, add each presenter as a collaborator, as the handoff guide describes.

## Make The Copy That Is Handed Out

The demo is handed out as two zip files with no history: the repository, from `main`, and the fallback, from `backup/modern`. In your own full copy, with both branches pushed, take them from GitHub's copies:

    git fetch origin
    git archive --format=zip --prefix=tax-disc/ -o ~/tax-disc-repository.zip origin/main
    git archive --format=zip -o ~/tax-disc-fallback.zip origin/backup/modern modern
    zip -z ~/tax-disc-repository.zip < /dev/null
    zip -z ~/tax-disc-fallback.zip < /dev/null

`git archive` takes only what Git tracks, so nothing local or ignored goes in, and it keeps `demo.sh` executable. It writes the commit's identifier into each zip's comment, which would point back to your repository; the two `zip -z` lines remove it. Send both zips with the handoff guide.
