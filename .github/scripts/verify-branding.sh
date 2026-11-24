#!/usr/bin/env bash
# Branding guard for MovieZen-TUI.
#
# Fails when upstream branding leaks back into a code or distribution surface,
# or when a preserved provider identity is accidentally renamed.
#
# Documentation is deliberately not scanned: README, NOTICE, REBRANDING.md and
# docs/upstream-sync.md must be able to name the upstream project for attribution.
#
# Run it locally with:  bash .github/scripts/verify-branding.sh
set -euo pipefail

cd "$(dirname "$0")/../.."

status=0

fail() {
    printf 'branding: %s\n' "$1" >&2
    status=1
}

# Surfaces that must never carry upstream branding. src/providers/moviebox is
# excluded: it is an upstream compatibility interface, not branding.
SCAN_PATHS=(
    src
    tests
    Cargo.toml
    install.sh
    install.ps1
    .githooks
    Formula
    bucket
    npm
    .github/workflows/ci.yml
    .github/workflows/release.yml
    .github/workflows/manifests.yml
    .github/workflows/publish.yml
    .github/workflows/pages.yml
    .github/workflows/stale.yml
    .github/workflows/incomplete-issue.yml
    .github/dependabot.yml
    .github/release.yml
    .github/ISSUE_TEMPLATE
)

UPSTREAM_PATTERN='mesamirh|MovieBox-Tui|MovieBox-TUI|moviebox-tui|moviebox_tui|MOVIEBOX_'

HITS=$(grep -rInE "$UPSTREAM_PATTERN" "${SCAN_PATHS[@]}" \
    --exclude-dir=moviebox \
    --exclude-dir=node_modules \
    | grep -vE 'LEGACY_APP_NAME|Directory name used by the upstream' \
    || true)
if [ -n "$HITS" ]; then
    printf '%s\n' "$HITS" >&2
    fail "upstream branding found in a code or distribution surface"
fi

# The preserved provider identity must still exist.
if [ ! -d src/providers/moviebox ]; then
    fail "missing preserved provider module: src/providers/moviebox"
fi

for required in "ProviderKind::MovieBox" 'name = "moviezen-tui"' 'name = "moviezen"'; do
    if ! grep -rIqF -- "$required" src Cargo.toml; then
        fail "missing preserved identifier: $required"
    fi
done

if ! grep -qF 'pub const OWNER: &str = "sabeel-sufiyan";' src/updater/check.rs; then
    fail "the updater must check MovieZen releases, not the upstream repository"
fi

# The official wordmark must be present, and the landing screen must use it.
if ! grep -q 'LOGO_FULL' src/branding.rs; then
    fail "src/branding.rs is missing the official wordmark"
fi

if ! grep -q 'crate::branding::wordmark' src/tui/screens/home.rs; then
    fail "the landing screen does not render the official wordmark"
fi

if [ "$status" -eq 0 ]; then
    printf 'branding: ok\n'
fi
exit "$status"
