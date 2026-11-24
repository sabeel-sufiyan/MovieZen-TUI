# Custom files and modifications

Everything MovieZen-TUI adds or changes on top of upstream MovieBox-Tui is listed
here so that an upstream merge can be reviewed quickly. Keep this list current:
the upstream synchronization pull request is judged against it.

## Branding-only changes

These files exist in upstream and were modified. They contain no application
logic, so an upstream change to them is expected and safe to re-apply.

| Area | Files | Change |
| :--- | :--- | :--- |
| Crate metadata | `Cargo.toml` | package `moviezen-tui`, binary `moviezen`, lib `moviezen_tui`, new repository/homepage/keywords |
| Identity constants | `src/branding.rs` (new) | wordmark art, tagline, creator, installer logo, ASCII fallback |
| Landing screen | `src/tui/screens/home.rs` | renders `crate::branding::wordmark()` instead of inline art |
| CLI | `src/main.rs` | `moviezen` naming in `--help`/`--version`, new `--logo` flag, tagline and creator lines |
| Storage | `src/config.rs` | `APP_NAME = "moviezen"`, legacy `moviebox-tui` directory reuse |
| User agent / stream label | `src/net.rs`, `src/download.rs` | `MovieZen-TUI` naming |
| Update feed | `src/updater/check.rs`, `src/updater/*` | checks `sabeel-sufiyan/MovieZen-TUI` releases |
| Repository links | `src/tui/app/system.rs` | project URL |
| Documentation | `README*.md`, `docs/*.md`, `CONTRIBUTING.md`, `book.toml` | product name, commands, storage paths, new pages |
| Installers | `install.sh`, `install.ps1` | wordmark, creator credit, `moviezen-tui` alias |
| Distribution | `Formula/moviezen-tui.rb`, `bucket/moviezen-tui.json`, `.github/workflows/*` | package names, asset names, approval gate |
| Hooks | `.githooks/pre-commit` | product name in output |

## New files (no upstream counterpart)

| File | Purpose |
| :--- | :--- |
| `src/branding.rs` | single source of truth for identity and wordmark |
| `npm/` | npm distribution wrapper (`moviezen-tui`) around the Rust binaries |
| `npm/bin/cli.js`, `npm/lib/*.js`, `npm/test/smoke.js` | wrapper, platform matrix, downloader, offline smoke test |
| `.github/workflows/upstream-sync.yml` | automated upstream synchronization |
| `.github/scripts/verify-branding.sh` | branding guard used by CI and the sync workflow |
| `.github/upstream-sync.json` | last synchronized upstream commit (written by the sync) |
| `docs/upstream-sync.md`, `docs/custom-changes.md` | synchronization policy and this list |
| `REBRANDING.md` | branding migration report |
| `NOTICE` | upstream attribution |

## Deliberately preserved from upstream

These look like branding but are compatibility interfaces. Do not rename them:

- `src/providers/moviebox/` and every `moviebox` provider identifier
  (`ProviderKind::MovieBox`, provider slug `moviebox`, `moviebox_enabled` in
  `config.json`, `moviebox_tracker.lua`, `moviebox_subs`).
- The upstream copyright notices in `LICENSE-MIT` and `LICENSE-APACHE`.
- `CHANGELOG.md` entries written before the fork.

## Removed from upstream

- The upstream author's cryptocurrency donation block in `README.md`, and the
  Telegram badge: they point at accounts MovieZen-TUI does not control.

## Merge checklist

1. `bash .github/scripts/verify-branding.sh` passes.
2. `src/branding.rs` is unchanged by the merge.
3. `npm/` is unchanged by the merge, and `node npm/test/smoke.js` passes.
4. `Cargo.toml` still declares `name = "moviezen-tui"` and `[[bin]] name = "moviezen"`.
5. Installer wordmark and creator credit are intact.
6. Upstream's new features are present; no upstream file was dropped.
