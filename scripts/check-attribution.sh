#!/usr/bin/env bash
#
# Fail if any commit in a range credits a model or AI tool.
#
# Everything in this repository is authored by its owner. No assistant gets a
# byline — see AGENTS.md, "Commit & Pull Request Guidelines". This script is the
# enforcement behind that rule so it cannot be forgotten.
#
# Usage:
#   scripts/check-attribution.sh                # HEAD vs origin/main (default)
#   scripts/check-attribution.sh <base>         # <base>..HEAD
#   scripts/check-attribution.sh <base> <head>  # explicit range
#   scripts/check-attribution.sh --message FILE # lint one message file (git hook)
#
# It inspects commit *messages*, never file contents, so prose that discusses
# attribution (this script, AGENTS.md) can never trip it.

set -euo pipefail

# Trailers and footers that name a model, vendor, or assistant tool. Kept as one
# extended-regex alternation so a single grep covers messages and trailers.
readonly PATTERN='(co-authored-by|signed-off-by|assisted-by|authored-by)[[:space:]]*:.*(claude|anthropic|openai|chatgpt|gpt-|codex|copilot|gemini|cursor|devin|bot@|noreply@anthropic)|generated[[:space:]]+(with|by)[[:space:]]+.*(claude|anthropic|openai|chatgpt|copilot|codex|gemini|cursor)|(created|written|produced)[[:space:]]+(with|by)[[:space:]]+.*(claude|anthropic|copilot|codex)|🤖'

fail() {
  echo "" >&2
  echo "✖ Model attribution found in commit message(s):" >&2
  echo "" >&2
  printf '%s\n' "$1" >&2
  echo "" >&2
  echo "This repository credits no assistant. Remove the trailer or footer and amend:" >&2
  echo "  git commit --amend" >&2
  echo "" >&2
  echo "See AGENTS.md → Commit & Pull Request Guidelines." >&2
  exit 1
}

# ── Single-message mode, for a commit-msg git hook ──────────────────
if [[ "${1:-}" == "--message" ]]; then
  msg_file="${2:?--message needs a file path}"

  # An unreadable path must not pass. `grep` exits 2 on error, and a bare
  # `if hits=$(grep ...)` reads any non-zero exit as "no match" — so a wrong
  # path would let the hook wave a bad commit straight through.
  if [[ ! -r "$msg_file" ]]; then
    echo "✖ Cannot read commit message file: $msg_file" >&2
    exit 1
  fi

  # 0 = matched, 1 = no match, 2+ = grep itself failed. Only 1 is a pass.
  set +e
  hits=$(grep -inE "$PATTERN" "$msg_file")
  grep_rc=$?
  set -e

  if (( grep_rc == 0 )); then
    fail "$hits"
  elif (( grep_rc > 1 )); then
    echo "✖ Could not scan $msg_file (grep exit $grep_rc)." >&2
    exit 1
  fi

  echo "✔ commit message carries no model attribution"
  exit 0
fi

# ── Range mode, for CI ──────────────────────────────────────────────
base="${1:-}"
head_ref="${2:-HEAD}"

if [[ -z "$base" ]]; then
  # No base given: prefer the remote default branch, else the repo root.
  if git rev-parse --verify --quiet origin/main >/dev/null; then
    base="origin/main"
  else
    base="$(git rev-list --max-parents=0 "$head_ref" | tail -1)"
  fi
fi

# Two very different failure shapes, and they must not share a branch.
#
# The `^{commit}` peel is load-bearing: `git rev-parse --verify` succeeds for ANY
# well-formed 40-character hex, whether or not the object exists. Without the
# peel a bogus SHA looked resolvable, `git rev-list` then failed, and an earlier
# version swallowed that with `|| true` and printed a green tick having scanned
# nothing — precisely when it mattered most.
if [[ "$base" =~ ^0+$ ]]; then
  # All zeros is how GitHub reports "this ref did not exist before the push".
  # Legitimate, so degrade — but prefer the default branch over the bare tip, so
  # a new branch still gets every one of its own commits scanned.
  if git rev-parse --verify --quiet "origin/main^{commit}" >/dev/null; then
    echo "Base is all zeros (new ref); comparing against origin/main."
    range="origin/main...$head_ref"
  elif git rev-parse --verify --quiet "${head_ref}~1^{commit}" >/dev/null; then
    echo "Base is all zeros (new ref) and no origin/main; scanning the tip."
    range="$head_ref~1..$head_ref"
  else
    echo "Base is all zeros and $head_ref is the root commit; scanning it alone."
    range="$head_ref"
  fi
elif ! git rev-parse --verify --quiet "${base}^{commit}" >/dev/null; then
  # A non-zero base that does not resolve means history moved under us — a
  # force-pushed or rewritten base branch. Scanning some subset and calling it
  # a pass would defeat the entire purpose of this job.
  echo "" >&2
  echo "✖ Base '$base' does not resolve to a commit." >&2
  echo "  History may have been rewritten. Refusing to scan a partial range" >&2
  echo "  and report success." >&2
  exit 1
else
  # Three-dot: compare against the merge-base, so commits already on the base
  # branch are not re-scanned. Existing history is deliberately grandfathered.
  range="$base...$head_ref"
fi

# No `|| true`. An unresolvable range must fail the job, never pass it quietly.
if ! commits=$(git rev-list "$range"); then
  echo "" >&2
  echo "✖ Could not resolve the commit range '$range'." >&2
  echo "  Refusing to report success without scanning any commits." >&2
  exit 1
fi

if [[ -z "$commits" ]]; then
  echo "✔ no new commits to scan ($range)"
  exit 0
fi

count=$(printf '%s\n' "$commits" | wc -l | tr -d ' ')
offenders=""

while IFS= read -r sha; do
  [[ -z "$sha" ]] && continue
  message=$(git log -1 --format='%B%n%(trailers)' "$sha")
  # 0 = matched, 1 = no match, 2+ = grep failed. Treating 2 as "clean" is how a
  # scanner silently stops scanning, so make it loud.
  set +e
  hits=$(printf '%s\n' "$message" | grep -inE "$PATTERN")
  grep_rc=$?
  set -e
  if (( grep_rc > 1 )); then
    echo "✖ Could not scan commit $sha (grep exit $grep_rc)." >&2
    exit 1
  fi
  if (( grep_rc == 0 )); then
    subject=$(git log -1 --format='%h %s' "$sha")
    offenders+="  ${subject}"$'\n'
    while IFS= read -r line; do
      offenders+="      ${line}"$'\n'
    done <<<"$hits"
  fi
done <<<"$commits"

if [[ -n "$offenders" ]]; then
  fail "$offenders"
fi

echo "✔ ${count} commit(s) scanned, no model attribution ($range)"
