#!/bin/sh
# Builds the legacy programs: vedenq (green screen) and vedbatch (batch).
# Needs GnuCOBOL: brew install gnucobol
set -e
cd "$(dirname "$0")"
cobc -x -o vedenq VEDENQ.cbl VEDCALC.cbl
cobc -x -o vedbatch VEDBATCH.cbl VEDCALC.cbl
echo "Built legacy/vedenq and legacy/vedbatch"
