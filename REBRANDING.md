# MovieZen-TUI — branding migration report

Fork point: `b901738` — MovieBox-Tui v0.1.30 (upstream `main`, 2026-11-18).
This report records exactly what was rebranded, what was preserved on purpose,
and every item that still needs the owner's decision.

## 1. Identity

| Item | Value |
| :--- | :--- |
| Product name | MovieZen-TUI |
| Repository | https://github.com/sabeel-sufiyan/MovieZen-TUI |
| npm package | `moviezen-tui` |
| Primary command | `moviezen` |
| Secondary command | `moviezen-tui` (alias installed by npm, Homebrew, Scoop and both install scripts) |
| Crate / package name | `moviezen-tui` (library `moviezen_tui`) |
| Tagline | "Your Terminal. Your Cinema. Your Zen." |
| Creator | Umaiz Sufiyan |

## 2. Wordmark — one transcription defect, reported not silently fixed

The six-line logo supplied in the brief is a standard ANSI-Shadow rendering of
"MOVIEZEN". Five of its six lines measure exactly 66 terminal cells. **Line 4
measures 59 cells**: the `Z` glyph is missing, so the art cannot be aligned as
supplied.

As supplied (line 4, 59 cells):

```
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║╚════╝   ██╔══╝  ██║╚██╗██║
```

Used in the repository (line 4 restored to the same font's `Z` and `E` glyphs,
66 cells):

```
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║██╔══╝   ███╔╝  ██╔══╝  ██║╚██╗██║
```

Everything else in the supplied art is reproduced character for character,
including the trailing `───────────────────── ────────────────────` rule in the
README. The two-row installer logo (44 cells per line) is reproduced exactly as
supplied. `src/branding.rs` carries unit tests that assert every line's display
width, so a future edit cannot silently break the alignment.

If the owner prefers the art exactly as supplied, replace the `LOGO_FULL`
constant in `src/branding.rs`; the tests will then fail until the width is fixed,
which is the intended signal.

## 3. Where the identity is defined

| Surface | Location |
| :--- | :--- |
| Names, tagline, creator, all wordmarks | `src/branding.rs` |
| Landing screen wordmark | `src/tui/screens/home.rs` (renders `branding::wordmark()`) |
| `--help`, `--version`, `--logo` | `src/main.rs` |
| Config / data / cache directory names | `src/config.rs` (`APP_NAME = "moviezen"`) |
| User agent, stream label, log file names | `src/net.rs`, `src/download.rs`, `src/logging.rs` |
| Update feed | `src/updater/check.rs` (`OWNER = "sabeel-sufiyan"`, `REPOSITORY = "MovieZen-TUI"`) |
| Installer wordmark and creator credit | `install.sh`, `install.ps1` |
| Package manifests | `Formula/moviezen-tui.rb`, `bucket/moviezen-tui.json`, `npm/package.json` |
| Release assets | `MovieZen_<OS>_<arch>.tar.gz` / `.zip` |

## 4. Mechanical rename coverage

Applied across 72 files, verified by `bash .github/scripts/verify-branding.sh`:

| Pattern | Replacements |
| :--- | :--- |
| `moviebox_tui` (crate identifier) | 150 |
| `moviebox-tui` (binary, dirs, commands) | 179 |
| `MOVIEBOX_` (environment variables) | 87 |
| `MovieBox-Tui` / `MovieBox-TUI` (display name) | 123 |
| `MovieBox_` (release asset prefix) | 71 |
| `mesamirh/...` URLs and owner | 89 |

## 5. Deliberately preserved

Renaming these would break upstream compatibility, so they are unchanged:

- `src/providers/moviebox/` — the provider implementation.
- `ProviderKind::MovieBox`, provider slug `moviebox`, display label `MovieBox`.
- `moviebox_enabled` in `config.json`.
- `moviebox_tracker.lua`, `moviebox_subs` (data file names used by the player and
  subtitle paths).
- `LICENSE-MIT` and `LICENSE-APACHE` upstream copyright notices.
- `CHANGELOG.md` history written before the fork.

## 6. Behaviour changes that came with the rebrand

| Change | Reason |
| :--- | :--- |
| `MOVIEBOX_*` environment variables renamed to `MOVIEZEN_*` | user-facing branding. Not auto-migrated: the old names are no longer read. |
| Config/data/cache directories renamed to `moviezen` | branding, with an automatic fallback: an existing `moviebox-tui` directory keeps being used until a `moviezen` one exists. |
| `--logo` flag added | prints the wordmark, tagline and creator; used by the installers and docs. |
| `MOVIEZEN_ASCII_LOGO=1` | forces the plain-ASCII wordmark on terminals without box-drawing glyphs. |
| Update check points at `sabeel-sufiyan/MovieZen-TUI` | never install upstream binaries over MovieZen ones. |
| Crypto donation block and Telegram badge removed from the README | those accounts belong to the upstream author, not to MovieZen-TUI. |

## 7. Still needs the owner

1. **Confirm the wordmark line 4** (section 2) — restore the supplied line, or
   accept the corrected one.
2. **Push the repository.** Nothing has been pushed: the working tree is delivered
   as a zip with the full upstream history. `main` already points at the rebrand
   commit, and `rebrand/moviezen-identity` keeps it as one reviewable unit.
3. **Create the GitHub repository** `sabeel-sufiyan/MovieZen-TUI` if it does not
   exist, then push both branches:
   `git push -u origin main && git push -u origin rebrand/moviezen-identity`.
4. **Set secrets** before any release: `NPM_TOKEN` (npm), `CARGO_REGISTRY_TOKEN`
   (only if you also publish to crates.io).
5. **Replace the placeholder checksums** in `Formula/moviezen-tui.rb` and
   `bucket/moviezen-tui.json`. They are empty on purpose: the manifests workflow
   fills them from the first MovieZen release's `SHA256SUMS`.
6. **Decide the first version number.** It currently mirrors upstream v0.1.30 so
   the fork point is obvious; a fresh `0.2.0` is equally valid.
7. **Check the translated READMEs** (`README_BN.md`, `README_HI.md`,
   `README_ES.md`). Names and commands were renamed, the prose was not retranslated
   and still describes upstream wording.
