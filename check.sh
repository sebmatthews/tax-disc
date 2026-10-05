#!/bin/sh
# Tax Disc matching check.
# Rates every test vehicle through the old system (COBOL) and the new system
# (TypeScript on Node) and reports whether every answer matches.
# Run from the repository folder: sh check.sh

cd "$(dirname "$0")" || exit 1

# Always rebuild, so the check runs the COBOL as it is now, not an old build.
sh legacy/build.sh >/dev/null 2>&1 || { echo "Could not build the old system. Is GnuCOBOL installed? (brew install gnucobol)"; exit 1; }

if [ ! -f modern/batch.ts ]; then
  echo "The new system does not exist yet: there is no modern/batch.ts."
  exit 1
fi

rm -f test/legacy-run.dat test/modern-run.dat

./legacy/vedbatch test/vehicles.dat test/legacy-run.dat >/dev/null || { echo "The old system's batch run failed."; exit 1; }
node modern/batch.ts test/vehicles.dat test/modern-run.dat || { echo "The new system's batch run failed."; exit 1; }

node tools/compare.mjs test/vehicles.dat test/expected.dat test/legacy-run.dat test/modern-run.dat
