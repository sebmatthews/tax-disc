#!/bin/bash
# The Tax Disc demo command. Run it from Terminal in the tax-disc folder:
#
#   ./demo.sh check    once, after setting up the Mac: check it is ready
#   ./demo.sh start    before the demo: get everything to the starting point
#   ./demo.sh old      the before: open the green screen (Escape to leave it)
#                      (then point Cosine at the user story: see the demo guide)
#   ./demo.sh verify   when Cosine has finished: the matching check
#   ./demo.sh new      the after: open the new web page (Ctrl+C to stop it)
#   ./demo.sh backup   if the live run fails: put the finished fallback in place
#   ./demo.sh finish   after the demo: copy this run's work out, and reset
#
# Everything runs on this Mac. It needs Git, GnuCOBOL, Node and Cosine.
# Each run's work is copied to ~/tax-disc-runs, outside this folder, and this
# folder is then reset to exactly what is on GitHub, so the next run's agent
# can never find an earlier run's work or the fallback.

set -u
export GIT_TERMINAL_PROMPT=0

AGENT_LINE="Work through the user story in prompts/modernise.md."
BACKUP_BRANCH=backup/modern
URL=http://localhost:3000
PORT=3000
RUNS_DIR="$HOME/tax-disc-runs"
FALLBACK_MARK=.git/tax-disc-fallback-in-use

cd "$(dirname "$0")" || exit 1

say()  { printf '\n%s\n' "$*"; }
ok()   { printf '  ok      %s\n' "$*"; }
bad()  { printf '  PROBLEM %s\n' "$*"; }
fail() { printf '\nStopped: %s\n' "$*" >&2; exit 1; }
stamp() { date +%d%m-%H%M%S; }

in_repo() {
  if [ -f legacy/build.sh ] && [ -f check.sh ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 0
  fi
  fail "run this from the tax-disc folder."
}


has_changes() { [ -n "$(git status --porcelain 2>/dev/null)" ]; }

# Node must be 22.18 or later to run TypeScript directly.
node_ok() {
  local v major minor
  v=$(node -p 'process.versions.node' 2>/dev/null) || return 1
  major=${v%%.*}
  minor=${v#*.}; minor=${minor%%.*}
  [ "$major" -gt 22 ] || { [ "$major" -eq 22 ] && [ "$minor" -ge 18 ]; }
}

build_old() {
  sh legacy/build.sh >/dev/null 2>&1 || fail "the green screen would not build. Run ./demo.sh check."
}

# Copies anything a run left in this folder to ~/tax-disc-runs, outside the
# folder, so nothing is lost when the folder is reset.
copy_out() {
  local dest
  if [ -e modern ] || has_changes || [ -n "$(git log --oneline origin/main..HEAD 2>/dev/null)" ]; then
    dest="$RUNS_DIR/$(stamp)-$1"
    mkdir -p "$dest" || fail "could not make $dest."
    [ -e modern ] && cp -R modern "$dest/modern"
    git status --porcelain > "$dest/status.txt" 2>/dev/null
    git log --oneline "origin/main..HEAD" > "$dest/commits.txt" 2>/dev/null
    git diff "origin/main" > "$dest/changes.patch" 2>/dev/null
    ok "Copied the work left here to $dest"
  fi
}

# Resets this folder to exactly main as it is on GitHub: no other branches, no
# stash, no fetched copies of the fallback, no leftover files.
reset_folder() {
  local b
  if git fetch -q --depth 1 origin main 2>/dev/null; then
    ok "Up to date with GitHub"
  else
    bad "Could not reach GitHub; resetting to the copy already here"
  fi
  git checkout -q -f -B main origin/main 2>/dev/null || fail "could not reset to main."
  git clean -q -f -d -x || fail "could not remove leftover files."
  for b in $(git for-each-ref --format='%(refname:short)' refs/heads); do
    [ "$b" = main ] || git branch -q -D "$b"
  done
  git stash clear
  rm -f .git/FETCH_HEAD "$FALLBACK_MARK"
  git reflog expire --expire=now --all
  git gc -q --prune=now 2>/dev/null
  ok "This folder is exactly as it is on GitHub, with no earlier run's work"
}

# ---- Commands -------------------------------------------------------------

cmd_check() {
  local problems=0
  in_repo
  say "Checking this Mac"
  if git --version >/dev/null 2>&1; then ok "Git is installed"; else bad "Git is not installed (install guide, step 2)"; problems=1; fi
  if [ -n "$(git config user.name 2>/dev/null)" ] && [ -n "$(git config user.email 2>/dev/null)" ]; then
    ok "Git knows your name and email"
  else
    bad "Git does not know your name and email (install guide, step 4)"; problems=1
  fi
  if command -v cobc >/dev/null 2>&1; then ok "GnuCOBOL is installed"; else bad "GnuCOBOL is not installed (install guide, step 2)"; problems=1; fi
  if node_ok; then ok "Node is installed and recent enough"; else bad "Node is missing or older than 22.18 (install guide, step 2)"; problems=1; fi
  if command -v cos >/dev/null 2>&1; then ok "Cosine is installed"; else bad "Cosine is not installed (install guide, step 3)"; problems=1; fi
  if git ls-remote origin >/dev/null 2>&1; then ok "The demo can be reached on GitHub"; else bad "The demo cannot be reached on GitHub: check the internet connection, or your access"; problems=1; fi
  if command -v cobc >/dev/null 2>&1; then
    if sh legacy/build.sh >/dev/null 2>&1; then ok "The green screen builds"; else bad "The green screen does not build"; problems=1; fi
  fi
  if [ "$problems" -eq 0 ]; then say "This Mac is ready."; else say "Fix the problems above, then run ./demo.sh check again."; exit 1; fi
}

cmd_start() {
  local branch
  in_repo
  say "Getting to the starting point"
  copy_out leftover
  reset_folder
  [ -e modern ] && fail "a modern folder is still here. Download the demo again (install guide, step 5)."
  branch="demo/live-$(stamp)"
  git switch -q -c "$branch" || fail "could not start a branch for this run."
  ok "This run is on branch $branch"
  build_old
  ok "The green screen is built"
  say "Ready. Show the before with:  ./demo.sh old"
  printf '%s\n' "Then start Cosine in this folder (cos) and type exactly:" "" "    $AGENT_LINE" ""
  printf '%s\n' "If your Cosine set-up keeps memories between sessions, clear them first."
}

cmd_old() {
  in_repo
  [ -x legacy/vedenq ] || build_old
  exec ./legacy/vedenq
}

cmd_verify() {
  in_repo
  [ -f modern/batch.ts ] || fail "there is no new system yet (no modern/batch.ts). Has Cosine finished?"
  sh check.sh
}

cmd_new() {
  in_repo
  [ -f modern/server.ts ] || fail "there is no new web page yet (no modern/server.ts). Has Cosine finished?"
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    fail "something is already running the page on port $PORT, perhaps in another window. Press Ctrl+C there, then run ./demo.sh new again."
  fi
  say "Opening $URL in the browser. Press Ctrl+C here to stop the page."
  ( sleep 2; open "$URL" >/dev/null 2>&1 || true ) &
  exec node modern/server.ts
}

cmd_backup() {
  in_repo
  say "Putting the finished fallback in place"
  git fetch -q --depth 1 origin "$BACKUP_BRANCH" 2>/dev/null \
    || fail "could not fetch the fallback ($BACKUP_BRANCH) from GitHub. Check the internet connection."
  ok "Fetched the fallback"
  copy_out live-run
  rm -rf modern
  git checkout FETCH_HEAD -- modern 2>/dev/null || fail "the fallback has no modern folder."
  git reset -q -- modern
  touch "$FALLBACK_MARK"
  ok "The fallback is in place"
  sh check.sh || fail "the fallback does not match. Do not show it; close the demo instead."
  say "Show it with:  ./demo.sh new"
}

cmd_finish() {
  in_repo
  say "Finishing"
  if [ -f "$FALLBACK_MARK" ]; then
    ok "The fallback was in use; the live run was copied out when ./demo.sh backup ran"
  else
    copy_out run
  fi
  reset_folder
  say "Ready for the next ./demo.sh start. If the new web page is still running in another window, press Ctrl+C there."
}

# The braces make Bash read this whole block before running any of it, so a
# reset that replaces this file mid-run cannot change what runs next.
{
  case "${1:-}" in
    check)  cmd_check ;;
    start)  cmd_start ;;
    old)    cmd_old ;;
    verify) cmd_verify ;;
    new)    cmd_new ;;
    backup) cmd_backup ;;
    finish) cmd_finish ;;
    *) sed -n '2,16p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
  esac
  exit
}
