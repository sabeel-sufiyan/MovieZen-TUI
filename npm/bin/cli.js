#!/usr/bin/env node
'use strict';

/**
 * moviezen-tui — npm distribution wrapper around the official MovieZen-TUI
 * Rust binaries. The wrapper never re-implements the application: it resolves
 * the release asset for this platform, verifies its SHA-256 checksum and hands
 * the terminal over to the native process.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const pkg = require('../package.json');
const { resolveTarget } = require('../lib/platform');
const { installBinary } = require('../lib/install');

const BIN = 'moviezen';
const args = process.argv.slice(2);

function printVersion() {
  process.stdout.write(`${BIN} ${pkg.version}\n`);
}

function printWrapperHelp() {
  process.stdout.write(
    [
      `${BIN} ${pkg.version} — MovieZen-TUI`,
      'Your Terminal. Your Cinema. Your Zen.',
      'Created by Umaiz Sufiyan',
      '',
      'USAGE:',
      `    ${BIN} [OPTIONS]`,
      '',
      'The native binary is downloaded and checksum-verified on first run.',
      '',
      'OPTIONS:',
      '    -h, --help               Show the native help (downloads on first run)',
      '    -v, -V, --version        Print the version and exit',
      '    --wrapper-help           Show this wrapper help',
      '',
      'ENVIRONMENT:',
      '    MOVIEZEN_NPM_CACHE_DIR   Where the native binary is cached',
      '    MOVIEZEN_RELEASE_URL     Alternate release asset base URL',
      '',
    ].join('\n'),
  );
}

async function main() {
  if (args.includes('--wrapper-help')) {
    printWrapperHelp();
    return 0;
  }

  if (args.some((arg) => arg === '--version' || arg === '-v' || arg === '-V')) {
    printVersion();
    return 0;
  }

  let target;
  try {
    target = resolveTarget();
  } catch (error) {
    process.stderr.write(`moviezen-tui: ${error.message}\n`);
    return 1;
  }

  let executable;
  try {
    executable = await installBinary(target);
  } catch (error) {
    process.stderr.write(
      `moviezen-tui: unable to install the native binary: ${error.message}\n` +
        'Install from source instead: https://github.com/sufiyan-sabeel/MovieZen-TUI#build-from-source\n',
    );
    return 1;
  }

  if (!fs.existsSync(executable)) {
    process.stderr.write(`moviezen-tui: native binary missing at ${path.dirname(executable)}\n`);
    return 1;
  }

  const child = spawn(executable, args, { stdio: 'inherit' });

  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT']) {
    try {
      process.on(signal, () => {
        if (!child.killed) child.kill(signal);
      });
    } catch {
      /* signal not supported on this platform */
    }
  }

  child.on('error', (error) => {
    process.stderr.write(`moviezen-tui: failed to start native binary: ${error.message}\n`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code === null ? 1 : code);
  });
  return null;
}

main().then(
  (code) => {
    if (typeof code === 'number') process.exit(code);
  },
  (error) => {
    process.stderr.write(`moviezen-tui: ${error && error.message ? error.message : error}\n`);
    process.exit(1);
  },
);
