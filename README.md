<div align="center">

```
███╗   ███╗ ██████╗ ██╗   ██╗██╗███████╗███████╗███████╗███╗   ██╗
████╗ ████║██╔═══██╗██║   ██║██║██╔════╝╚══███╔╝██╔════╝████╗  ██║
██╔████╔██║██║   ██║██║   ██║██║█████╗    ███╔╝ █████╗  ██╔██╗ ██║
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║██╔══╝   ███╔╝  ██╔══╝  ██║╚██╗██║
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ██║███████╗███████╗███████╗██║ ╚████║
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝
───────────────────── ────────────────────
```

# MovieZen-TUI

**Your Terminal. Your Cinema. Your Zen.**

A modern, keyboard-first terminal media interface with cross-platform support.

Created by **Umaiz Sufiyan**

[ English ](README.md) • [ বাংলা ](README_BN.md) • [ हिन्दी ](README_HI.md) • [ Español ](README_ES.md)

[![CI](https://img.shields.io/github/actions/workflow/status/sufiyan-sabeel/MovieZen-TUI/ci.yml?branch=main&label=CI&logo=github&style=flat)](https://github.com/sufiyan-sabeel/MovieZen-TUI/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/moviezen-tui.svg?logo=npm&style=flat)](https://www.npmjs.com/package/moviezen-tui)
[![License](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg?style=flat)](#license)

</div>

## Features

- **Streaming:** Movies, TV series, anime, Asian dramas, and community Stremio addons across multiple native providers.
- **Live TV:** M3U playlist import with channel categories, EPG support, and search.
- **Resolution Picker:** Direct stream quality selection (`4K`, `1080p`, `720p`, `480p`, `Auto`) before playback.
- **Hardware Players:** Direct launch in `mpv`, `VLC`, or `IINA` with custom auth header and cookie forwarding.
- **Batch Downloader:** Multi-segment concurrent downloader with HTTP range pause and resume for episodes and full seasons.
- **Subtitle Picker:** Multi-language subtitle tracks extracted and selectable via an interactive picker before playback or download.
- **Terminal UI:** Vim navigation, mouse interaction, slash command palette (`/help`, `/settings`), and 9 built-in themes.
- **Cover Art:** Native Kitty, Sixel, and iTerm2 poster rendering with automatic text fallback.
- **Resume & Library:** Home deck with continue-watching timestamps, watch history, and favorites stored strictly on local disk. Zero telemetry.

## Prerequisites

- **Media Player:** `mpv`, `VLC`, or `IINA` (macOS) / any external video player (Android).
- **Posters:** Terminal with Sixel, Kitty, or iTerm2 support (Ghostty, Kitty, WezTerm, iTerm2, foot, Windows Terminal v1.22+).
- **DASH Downloads:** `yt-dlp` and `ffmpeg` (required only for MovieBox DASH downloads).

## Installation

### npm (any supported platform)

```bash
npx moviezen-tui
```

or install it globally to get both the `moviezen` and `moviezen-tui` commands:

```bash
npm install -g moviezen-tui
moviezen --version
```

The npm package is a thin wrapper: on first run it downloads the official MovieZen-TUI binary for your platform, verifies its SHA-256 checksum against the published `SHA256SUMS`, caches it, and hands the terminal to the native process. The application itself is Rust, not JavaScript.

### macOS & Linux

If you have [Homebrew](https://brew.sh/) on macOS:
```bash
brew tap sufiyan-sabeel/moviezen-tui https://github.com/sufiyan-sabeel/MovieZen-TUI
brew install moviezen-tui
```

> **Note:** If Homebrew prompts for tap verification on initial install, run `brew trust sufiyan-sabeel/moviezen-tui`.

Direct install via Terminal (macOS & Linux, no package manager needed):
```bash
curl -fsSL https://raw.githubusercontent.com/sufiyan-sabeel/MovieZen-TUI/main/install.sh | bash
```

The installer shows the MovieZen-TUI wordmark, detects your OS and architecture, offers install / update / uninstall / cancel when an existing copy is found, verifies the download checksum, and never escalates permissions unless a system directory actually needs it.

### Windows

If you have [Scoop](https://scoop.sh/) (recommended):
```powershell
scoop bucket add moviezen https://github.com/sufiyan-sabeel/MovieZen-TUI
scoop install moviezen-tui
```

Direct install via PowerShell (no package manager needed):
```powershell
irm https://raw.githubusercontent.com/sufiyan-sabeel/MovieZen-TUI/main/install.ps1 | iex
```

> **SmartScreen prompt:** If Windows displays *"Windows protected your PC"*, click **More info** → **Run anyway**.

### Android (Termux)
```bash
pkg update && pkg install -y curl tar termux-tools termux-am
curl -fsSL https://raw.githubusercontent.com/sufiyan-sabeel/MovieZen-TUI/main/install.sh | bash
termux-setup-storage
```

<details>
<summary><b>Cargo & Source Build</b></summary>

```bash
cargo install moviezen-tui --locked
```

From source:
```bash
git clone https://github.com/sufiyan-sabeel/MovieZen-TUI.git
cd MovieZen-TUI
cargo build --release --locked
```

</details>

<details>
<summary><b>Verify Release Integrity</b></summary>

```bash
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify <archive-file> -R sufiyan-sabeel/MovieZen-TUI
```

</details>

<details>
<summary><b>Uninstall</b></summary>

Re-run the install command (`curl ... | bash` or `irm ... | iex`) and select `2) Uninstall`.

Or via package manager:
```bash
brew uninstall moviezen-tui     # Homebrew
scoop uninstall moviezen-tui    # Scoop
cargo uninstall moviezen-tui    # Cargo
npm uninstall -g moviezen-tui   # npm
```

Your configuration and library are never touched by the uninstaller. Remove them yourself if you want a clean slate:

| Platform | Configuration | Data | Cache |
| :--- | :--- | :--- | :--- |
| Linux / macOS / Termux | `~/.config/moviezen/` | `~/.local/share/moviezen/` | `~/.cache/moviezen/` |
| Windows | `%APPDATA%\moviezen\` | `%APPDATA%\moviezen\` | `%LOCALAPPDATA%\moviezen\` |

</details>

## Supported platforms

| Platform | Architecture | Binary | npm wrapper |
| :--- | :--- | :--- | :--- |
| Linux | x64 | `MovieZen_Linux_x64.tar.gz` | yes |
| Linux | arm64 | `MovieZen_Linux_arm64.tar.gz` | yes |
| macOS | x64 + arm64 (universal) | `MovieZen_macOS_Universal.tar.gz` | yes |
| Windows | x64 | `MovieZen_Windows_x64.zip` | yes |
| Windows | arm64 | `MovieZen_Windows_arm64.zip` | yes |
| Android (Termux) | arm64 | `MovieZen_Android_arm64.tar.gz` | yes, when the npm runtime works under Termux |

Other architectures are not claimed until a verified build exists. The npm wrapper refuses unsupported targets instead of guessing.

## Usage

```bash
moviezen                    # start the interface
moviezen --help             # options, environment variables
moviezen --version          # version
moviezen --logo             # print the MovieZen-TUI wordmark and exit
```

Inside the interface:

- Type to search, press `Enter` to play.
- Press `?` for the full keybinding list, or type `/settings` for preferences.
- Slash commands: `/settings`, `/config`, `/browse`, `/history`, `/favorites`, `/clear`, `/help`, `/list`, `/exit`.

## Keyboard shortcuts

| Key | Action |
| :--- | :--- |
| `j` / `k` or `↓` / `↑` | Move down / up |
| `h` / `l` or `←` / `→` | Switch pane / section |
| `g` / `G` | Jump to top / bottom |
| `Enter` | Open details, play, or confirm |
| `/` | Focus the search box |
| `?` | Keybinding help |
| `f` | Favorite the selected title |
| `d` | Download the selected title or episode |
| `Tab` / `Shift+Tab` | Cycle content mode and provider |
| `q` / `Esc` | Go back, or quit from the landing screen |

The complete, always-current list lives in [docs/controls.md](docs/controls.md).

## Configuration

Settings live in `config.json` inside your platform configuration directory and are editable from `/settings`. Environment variables override individual settings:

| Variable | Purpose |
| :--- | :--- |
| `MOVIEZEN_LOG` | Log level (`off`, `error`, `warn`, `info`, `debug`, `trace`) |
| `MOVIEZEN_THEME` | Theme name (`catppuccin`, `dracula`, `nord`, …) |
| `MOVIEZEN_PLAYER` | Preferred player (`mpv`, `iina`, `vlc`, `android`) |
| `MOVIEZEN_MPV_PATH`, `MOVIEZEN_VLC_PATH`, `MOVIEZEN_IINA_PATH` | Custom player binary paths |
| `MOVIEZEN_CONFIG_DIR`, `MOVIEZEN_DATA_DIR`, `MOVIEZEN_CACHE_DIR` | Override storage locations |
| `MOVIEZEN_NO_IMAGE` | Disable poster image queries (`1`/`true`) |
| `MOVIEZEN_IMAGE_PROTOCOL` | Force a graphics protocol (`kitty`, `sixel`, `iterm2`, `none`) |
| `MOVIEZEN_CELL_SIZE` | Override terminal cell size as `WxH` |
| `MOVIEZEN_ASCII_LOGO` | Force the plain-ASCII wordmark (`1`) |

Full reference: [docs/config.md](docs/config.md).

### Upgrading from MovieBox-Tui

MovieZen-TUI reuses an existing `~/.config/moviebox-tui`, `~/.local/share/moviebox-tui` or `~/.cache/moviebox-tui` directory while no MovieZen directory exists yet, so your settings, history and favorites carry over on the first run. Environment variables were renamed from `MOVIEBOX_*` to `MOVIEZEN_*`; update any that you set yourself.

## Updating

- **npm:** `npm update -g moviezen-tui`
- **Homebrew:** `brew upgrade moviezen-tui`
- **Scoop:** `scoop update moviezen-tui`
- **Cargo:** `cargo install moviezen-tui --locked --force`
- **Install script:** re-run it; it detects the installed version and offers update, uninstall or exit.

In-app auto-update checks the MovieZen-TUI release feed (never the upstream project's) and can be disabled in `/settings`.

## Troubleshooting

| Symptom | Fix |
| :--- | :--- |
| No posters, only text | Your terminal needs Kitty, Sixel or iTerm2 graphics. Try `MOVIEZEN_IMAGE_PROTOCOL=kitty` or accept the text fallback. |
| `moviezen: command not found` after the install script | Restart the shell, or `source ~/.bashrc` / `~/.zshrc` — the installer adds the binary directory to `PATH`. |
| Video opens in nothing | Install `mpv`, `VLC` or `IINA`, then set it in `/settings` or with `MOVIEZEN_PLAYER`. |
| Downloads fail with `403` | Streams are token-bound; retry from the details screen so fresh headers are forwarded. |
| Termux binary is rejected | Install through `pkg install -y rust clang && cargo install moviezen-tui --locked`. |
| Garbled wordmark | Your terminal lacks box-drawing glyphs: set `MOVIEZEN_ASCII_LOGO=1`. |
| Debug logging | `MOVIEZEN_LOG=debug moviezen`, then read the log path printed in [docs/debugging.md](docs/debugging.md). |

## Upstream synchronization policy

MovieZen-TUI is a fork of [MovieBox-Tui](https://github.com/mesamirh/MovieBox-Tui) by Samir (`mesamirh`). It tracks upstream deliberately:

- `upstream` stays a permanent Git remote; the default branch is resolved dynamically.
- A daily workflow (`.github/workflows/upstream-sync.yml`, plus manual dispatch) detects new upstream commits and releases.
- Upstream changes arrive as an **integration pull request** on a `sync/upstream-*` branch, never as a direct push to `main` and never as an automatic release.
- Only demonstrably mechanical conflicts (`CHANGELOG.md`, `Cargo.lock`) are resolved automatically. Anything else stops the sync and opens an issue for a human.
- A branding guard runs on every sync so MovieZen identity is never overwritten, and the test suite must pass before the pull request is marked ready.
- Custom files and modifications are listed in [docs/custom-changes.md](docs/custom-changes.md).

Details: [docs/upstream-sync.md](docs/upstream-sync.md).

## Documentation

Full documentation lives in [`docs/`](docs/):

| Guide | Description |
| :--- | :--- |
| [Keyboard & Controls](docs/controls.md) | Keybindings, vim navigation, and shortcuts |
| [Configuration](docs/config.md) | Settings, themes, and environment variables |
| [Content Providers](docs/providers.md) | Native scrapers (MovieBox, 4KHDHub, Dramachi, BDIX) |
| [Stremio Addons](docs/addons-mode.md) | Community addon configuration and streaming |
| [Hardware Players](docs/players.md) | Player detection, launch options, and flags |
| [Live TV & IPTV](docs/tv-mode.md) | M3U playlist import and channel streaming |
| [Batch Downloads](docs/downloads.md) | HTTP range engine, pause, and resume |
| [Upstream Sync](docs/upstream-sync.md) | How upstream improvements reach MovieZen-TUI |

## Contributing

Review [CONTRIBUTING.md](CONTRIBUTING.md) before submitting pull requests. Report bugs via [GitHub Issues](https://github.com/sufiyan-sabeel/MovieZen-TUI/issues).

## Privacy

Zero telemetry, analytics, or user tracking. History, favorites, and configuration remain on your disk.

## License and attribution

Dual-licensed under [MIT](LICENSE-MIT) or [Apache-2.0](LICENSE-APACHE), the same terms as the upstream project.

MovieZen-TUI is derived from [MovieBox-Tui](https://github.com/mesamirh/MovieBox-Tui) (MIT OR Apache-2.0), created by Samir (`mesamirh`). The upstream copyright notices are preserved in [LICENSE-MIT](LICENSE-MIT), [LICENSE-APACHE](LICENSE-APACHE) and [NOTICE](NOTICE). The `moviebox` provider module, its wire protocol and provider identity are upstream compatibility interfaces and are kept unchanged.

## Disclaimer

MovieZen-TUI does not host or store media. It plays publicly available streams. Users must comply with local laws.
