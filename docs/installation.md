# Installation

MovieZen-TUI is available across macOS, Linux, Windows, and Android (Termux).

---

## npm (every supported platform)

The npm package is a wrapper around the official Rust binaries. It resolves the
release archive for your platform, verifies its SHA-256 checksum, caches it and
then hands the terminal to the native process.

```bash
npx moviezen-tui            # run without installing
npm install -g moviezen-tui # installs the moviezen and moviezen-tui commands
```

Requires Node.js 18 or newer. The wrapper refuses platforms without a verified
build instead of guessing; see [npm.md](npm.md) for the platform matrix and the
cache location.

---

## macOS and Linux

### Homebrew (macOS)

If you have [Homebrew](https://brew.sh/):

```bash
brew tap sabeel-sufiyan/moviezen-tui https://github.com/sabeel-sufiyan/MovieZen-TUI
brew install moviezen-tui
```

> [!NOTE]
> If Homebrew prompts for tap verification on initial install, run `brew trust sabeel-sufiyan/moviezen-tui`.

### Direct Terminal Script

No package manager required. Open Terminal and run:

```bash
curl -fsSL https://raw.githubusercontent.com/sabeel-sufiyan/MovieZen-TUI/main/install.sh | bash
```

---

## Windows

### Scoop Package Manager (Recommended)

If you have [Scoop](https://scoop.sh/):

```powershell
scoop bucket add moviezen https://github.com/sabeel-sufiyan/MovieZen-TUI
scoop install moviezen-tui
```

### Direct PowerShell Script

No package manager required. Open **PowerShell** and run:

```powershell
irm https://raw.githubusercontent.com/sabeel-sufiyan/MovieZen-TUI/main/install.ps1 | iex
```

> **SmartScreen prompt:** If Windows displays *"Windows protected your PC"*, click **More info** → **Run anyway**.
---

## Android (Termux)

Open Termux and run:

```bash
pkg update && pkg install -y curl tar termux-tools termux-am
curl -fsSL https://raw.githubusercontent.com/sabeel-sufiyan/MovieZen-TUI/main/install.sh | bash
termux-setup-storage
```

> [!IMPORTANT]
> Video playback on Android launches through your installed external media player (such as VLC, Just Player, or MX Player).
---

## Cargo (Crates.io)

Install directly using Cargo:

```bash
cargo install moviezen-tui --locked
```

---

## Compile from Source

Clone the repository and build the release binary:

```bash
git clone https://github.com/sabeel-sufiyan/MovieZen-TUI.git
cd MovieZen-TUI
cargo build --release --locked
```

The compiled binary will be located at `target/release/moviezen`.

---

## Verify Release Integrity

All release assets include cryptographically signed SHA-256 checksums and GitHub provenance attestations:

```bash
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify <archive-file> -R sabeel-sufiyan/MovieZen-TUI
```
---

## Uninstallation

### Automated Installer (macOS, Linux, Windows, Android)

Simply re-run your original install command (`curl ... | bash` or `irm ... | iex`). When MovieZen-TUI is already installed, the installer automatically detects it and displays an interactive menu:

```text
MovieZen-TUI is already installed.
What would you like to do?
  1) Reinstall / Update to latest version
  2) Uninstall
  3) Cancel
```

Enter `2` to completely remove MovieZen-TUI from your system.

### Package Managers

```bash
brew uninstall moviezen-tui     # Homebrew (macOS)
scoop uninstall moviezen    # Scoop (Windows)
cargo uninstall moviezen    # Cargo
```
