# Admin Guide

Status: draft, 5 October 2026. For the demo's owner: the occasional steps behind the demo, which presenters never do. Presenters follow the install guide and, when it exists, the demo guide.

## What Lives Where

The repository holds what presenters and the coding agent see: the old system, the test vehicles and their recorded answers, the matching check, the work item for the agent and these guides.

Two things are kept out of the repository on purpose, in the demo's working folder: the written rules the old system was built to, and the tool that generates the test vehicles. Both would give the rules away to the agent, which is meant to work them out from the COBOL. Never add them, or anything that describes the rules, to the repository.

## Branches

`main` is what the agent starts from. It has no `modern/` folder.

A full clone of the repository carries its whole history and every branch, and the agent can read both: the history holds an early commit with the written rules, and `backup/modern` holds the finished answer. So presenters clone `main` only, with no history, as the install guide shows. Never tell presenters to run a plain `git clone`.

`backup/modern` holds a finished modern version, built to the same work item, for use if a live run fails. It must always pass `sh check.sh`.

Rehearsals run on branches named `try/...`, so each run's work is kept and can be compared.

## Change The Old System Or The Test Vehicles

The recorded answers in `test/expected.dat` are the standard everything is judged by, so change them only on purpose, and only together with what caused them to change.

1. To change the test vehicles, edit the generator in the working folder's `_tools` folder, then run it from the working folder, writing over `test/vehicles.dat`:

        node _tools/make-vehicles.mjs ~/Developer/tax-disc/test/vehicles.dat

2. Rebuild the old system and record its answers again, from the repository folder:

        sh legacy/build.sh
        ./legacy/vedbatch test/vehicles.dat test/expected.dat

3. Commit both files on `main` and push them with `git push`, then bring the backup up to date (below).

## Bring The Backup Up To Date

After any change to `main`, bring it into the backup and check the backup still matches:

    git switch backup/modern
    git merge main
    sh check.sh

If the check does not say MATCH, stop: do not push, and fix the backup first. If it does:

    git push
    git switch main

## Give A Presenter Access

The repository is public, so presenters need no invitation: they download it with the command in the install guide.

## Make The Copy That Is Handed Out

Not settled yet. As with Joint Keepers, the handed-out copy is a zip made from the repository with no history, so it carries none of the earlier commits. How the fallback travels with it is to be settled with the demo command.
