# npm package

MovieZen-TUI ships through npm as `moviezen-tui`. The package is a **wrapper**,
not a rewrite: the application is the Rust binary built by the release workflow,
and the wrapper only resolves, verifies and launches it.

```
npm/
├── bin/cli.js          entry point for both `moviezen` and `moviezen-tui`
├── lib/platform.js     platform/architecture -> release asset matrix
├── lib/install.js      download, SHA-256 verification, tar.gz/zip extraction
├── test/smoke.js       offline end-to-end test (loopback HTTP server)
├── package.json
├── README.md
└── LICENSE-MIT, LICENSE-APACHE
```

## What the wrapper does

1. `--version` and `--wrapper-help` are answered without touching the network.
2. `resolveTarget()` maps `process.platform`/`process.arch` to one of the six
   released archives. Termux is detected through `TERMUX_VERSION`/`PREFIX` and
   mapped to the Android arm64 build. Unknown targets raise
   `MOVIEZEN_UNSUPPORTED_PLATFORM` instead of downloading something untested.
3. `installBinary()` downloads `SHA256SUMS` first, refuses to continue if the
   expected asset is not listed, downloads the archive, compares digests and
   only then extracts it.
4. The binary is cached per version outside the package
   (`~/.cache/moviezen-tui/npm/v<version>`, or
   `%LOCALAPPDATA%\MovieZen-TUI\npm\v<version>` on Windows), so later runs and
   `npx` invocations do not re-download it.
5. The native process is spawned with `stdio: 'inherit'`; `SIGINT`, `SIGTERM`,
   `SIGHUP` and `SIGQUIT` are forwarded, and the native exit code becomes the
   wrapper's exit code.

Binaries are never downloaded from the upstream MovieBox repository.

## Versioning

`npm/package.json` and `Cargo.toml` are kept in step. The Release workflow
rewrites the npm version from `Cargo.toml` before publishing, and the npm job only
runs when the release is approved (`publish_release=true`).

## Testing

```bash
node npm/test/smoke.js
```

The test builds a fake release archive, serves it from a loopback HTTP server and
exercises the real code path: download, checksum verification, extraction,
argument forwarding, exit-code forwarding, checksum-mismatch refusal and cache
reuse. No network access is required.

## Publishing checklist

1. `node npm/test/smoke.js` passes.
2. `Cargo.toml` and `npm/package.json` versions match.
3. `LICENSE-MIT` and `LICENSE-APACHE` are present in `npm/`.
4. `npm pack --dry-run` lists only `bin/`, `lib/`, `README.md` and the licences.
5. The `NPM_TOKEN` repository secret is set.
6. Dispatch the Release workflow with `publish_release` enabled, then confirm
   with `npm view moviezen-tui version dist.tarball`.
