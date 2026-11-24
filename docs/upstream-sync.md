# Upstream synchronization

MovieZen-TUI is a fork of [MovieBox-Tui](https://github.com/mesamirh/MovieBox-Tui).
Staying close to upstream is a first-class requirement, not an afterthought: every
upstream feature, bug fix, performance improvement, security fix, platform
addition, dependency update and compatibility change should reach MovieZen-TUI in
a form that keeps MovieZen's identity intact.

This page describes how that works and what a maintainer has to do.

## The model

- `upstream` is a permanent Git remote pointing at `https://github.com/mesamirh/MovieBox-Tui.git`.
- `origin` is the MovieZen-TUI repository.
- `main` is protected by review: upstream changes never land on it directly.
- Upstream work arrives as a pull request on a `sync/upstream-YYYY-MM-DD` branch.
- Releases are independent of upstream version numbers.

## The workflow

`.github/workflows/upstream-sync.yml` runs:

- daily at 03:17 UTC,
- on manual dispatch (with an optional upstream branch/tag and a dry-run flag).

Steps:

1. Resolve the upstream default branch dynamically with
   `git ls-remote --symref upstream HEAD` — no hard-coded branch name.
2. Read the last synchronized upstream commit from `.github/upstream-sync.json`.
   When the file is missing or the commit is unknown, fall back to `git merge-base`.
3. Stop early when upstream is already fully merged.
4. Create `sync/upstream-<date>` and `git merge --no-ff upstream/<branch>`.
5. Resolve **only** mechanical conflicts automatically:
   - `CHANGELOG.md` — take the upstream version.
   - `Cargo.lock` — take the upstream version.
   Everything else stops the run: the merge is aborted, an issue titled
   *"Upstream sync needs manual conflict resolution"* is opened (or commented on
   when one is already open) with the conflicting paths, and nothing is pushed.
6. Write the new upstream commit into `.github/upstream-sync.json`.
7. Run the branding guard (`.github/scripts/verify-branding.sh`). A failure stops
   the run before anything is pushed.
8. Run `cargo fmt --check`, `cargo check --locked`, `cargo test --locked` and the
   npm wrapper smoke test.
9. Push the branch and open (or update) a pull request that lists the upstream
   commits, the checks that ran, and a reminder that this is an integration
   candidate. If any check failed the pull request is opened as a **draft**.

## Rules

Never:

- permanently detach from upstream,
- replace upstream with a one-time copied snapshot,
- disable future upstream synchronization,
- silently discard upstream improvements,
- merge failing changes into `main`,
- publish a release for every upstream commit,
- let the sync overwrite MovieZen branding, the npm wrapper or the installers.

Always:

- keep custom MovieZen changes isolated and documented in
  [custom-changes.md](custom-changes.md),
- preserve upstream MIT/Apache-2.0 notices,
- leave the `moviebox` provider module and its identifiers untouched,
- review the integration pull request like any other change.

## Manual recovery

When the workflow reports conflicts:

```bash
git remote add upstream https://github.com/mesamirh/MovieBox-Tui.git
git fetch upstream
git checkout -b sync/manual-$(date +%Y-%m-%d)
git merge upstream/main
# resolve by hand, keeping MovieZen branding and provider interfaces intact
bash .github/scripts/verify-branding.sh
cargo test --locked
git push -u origin HEAD
```

Then open the pull request and update `.github/upstream-sync.json` with the
upstream commit you merged so the next run starts from the right point.

## Versioning

MovieZen-TUI keeps its own semantic version in `Cargo.toml` (mirrored into
`npm/package.json` and the package manifests). An upstream version bump does not
force a MovieZen version bump, and an upstream release never publishes a MovieZen
release. Publishing requires an explicit `publish_release=true` dispatch of the
Release workflow.
