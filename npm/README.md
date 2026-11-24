# moviezen-tui (npm)

`npm install -g moviezen-tui` — the official npm distribution of
[MovieZen-TUI](https://github.com/sabeel-sufiyan/MovieZen-TUI).

**Your Terminal. Your Cinema. Your Zen.**

MovieZen-TUI is a Rust terminal application. This package does not reimplement
it in JavaScript: it resolves the release archive for your platform, downloads
it, verifies its SHA-256 checksum against the published `SHA256SUMS`, caches the
binary, and executes it with your arguments, signals and exit code passed
through.

## Usage

```bash
npx moviezen-tui            # run without installing
npm install -g moviezen-tui # install the moviezen and moviezen-tui commands
moviezen --version
moviezen --help
moviezen --logo
```

## Supported platforms

| Platform | Architecture | Release asset |
| :--- | :--- | :--- |
| Linux | x64 | `MovieZen_Linux_x64.tar.gz` |
| Linux | arm64 | `MovieZen_Linux_arm64.tar.gz` |
| macOS | x64, arm64 | `MovieZen_macOS_Universal.tar.gz` |
| Windows | x64 | `MovieZen_Windows_x64.zip` |
| Windows | arm64 | `MovieZen_Windows_arm64.zip` |
| Android (Termux) | arm64 | `MovieZen_Android_arm64.tar.gz` |

Any other platform fails with an explicit message instead of downloading a
binary that was never built or tested. Build from source in that case:

```bash
cargo install moviezen-tui --locked
```

## Where things are stored

The native binary is cached per version, outside the package, so upgrades and
`npx` runs do not re-download it:

| Platform | Cache directory |
| :--- | :--- |
| Linux / macOS / Termux | `$XDG_CACHE_HOME/moviezen-tui/npm/v<version>` (default `~/.cache/...`) |
| Windows | `%LOCALAPPDATA%\MovieZen-TUI\npm\v<version>` |

Override with `MOVIEZEN_NPM_CACHE_DIR`. `MOVIEZEN_RELEASE_URL` points the wrapper
at a mirror; it is intended for testing and self-hosting.

## Requirements

- Node.js 18 or newer (only for the wrapper — the application is native).
- A media player (`mpv`, `VLC` or `IINA`) for playback.

## Uninstall

```bash
npm uninstall -g moviezen-tui
```

Remove the cache directory above to reclaim the disk space used by the binary.

## Licence

MIT OR Apache-2.0, the same terms as the application and the upstream project.
See `LICENSE-MIT` and `LICENSE-APACHE` in this package, and the repository's
`NOTICE` for upstream attribution.
