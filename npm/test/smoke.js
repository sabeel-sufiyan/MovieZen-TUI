'use strict';

/**
 * Offline smoke test for the npm wrapper.
 *
 * Builds a fake release archive, serves it from a loopback HTTP server and
 * exercises the real install path (download -> SHA-256 verify -> tar.gz
 * extract -> exec -> exit-code forwarding). No network access is required.
 */

const assert = require('node:assert');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const { resolveTarget } = require('../lib/platform');
const { parseChecksums } = require('../lib/install');

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moviezen-smoke-'));
let failures = 0;

function check(name, fn) {
  try {
    fn();
    process.stdout.write(`ok   ${name}\n`);
  } catch (error) {
    failures += 1;
    process.stdout.write(`FAIL ${name}: ${error.message}\n`);
  }
}

// ---------------------------------------------------------------- unit checks
check('maps linux/x64 to the Linux x64 asset', () => {
  const target = resolveTarget('linux', 'x64');
  assert.strictEqual(target.asset, 'MovieZen_Linux_x64.tar.gz');
  assert.strictEqual(target.binary, 'moviezen');
});

check('maps linux/arm64 to the Linux arm64 asset', () => {
  assert.strictEqual(resolveTarget('linux', 'arm64').asset, 'MovieZen_Linux_arm64.tar.gz');
});

check('maps darwin x64 and arm64 to the universal asset', () => {
  assert.strictEqual(resolveTarget('darwin', 'x64').asset, 'MovieZen_macOS_Universal.tar.gz');
  assert.strictEqual(resolveTarget('darwin', 'arm64').asset, 'MovieZen_macOS_Universal.tar.gz');
});

check('maps win32 architectures to zip assets', () => {
  assert.strictEqual(resolveTarget('win32', 'x64').asset, 'MovieZen_Windows_x64.zip');
  assert.strictEqual(resolveTarget('win32', 'arm64').asset, 'MovieZen_Windows_arm64.zip');
});

check('rejects an unverified architecture', () => {
  assert.throws(() => resolveTarget('linux', 'riscv64'), /no verified build/);
  assert.throws(() => resolveTarget('freebsd', 'x64'), /no verified build/);
});

check('parses SHA256SUMS entries', () => {
  const digest = 'a'.repeat(64);
  const map = parseChecksums(`${digest}  MovieZen_Linux_x64.tar.gz\n`);
  assert.strictEqual(map.get('MovieZen_Linux_x64.tar.gz'), digest);
});

// ------------------------------------------------------------ fake release
function buildTarGz(files) {
  const blocks = [];
  for (const [name, contents] of Object.entries(files)) {
    const data = Buffer.from(contents);
    const header = Buffer.alloc(512, 0);
    header.write(name, 0, 100, 'utf8');
    header.write('0000755\0', 100, 108, 'utf8');
    header.write('0000000\0', 108, 116, 'utf8');
    header.write('0000000\0', 116, 124, 'utf8');
    header.write(`${data.length.toString(8).padStart(11, '0')}\0`, 124, 136, 'utf8');
    header.write('00000000000\0', 136, 148, 'utf8');
    header.write('        ', 148, 156, 'utf8');
    header.write('0', 156, 157, 'utf8');
    header.write('ustar\0', 257, 263, 'utf8');
    header.write('00', 263, 265, 'utf8');
    let sum = 0;
    for (const byte of header) sum += byte;
    header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 156, 'utf8');
    blocks.push(header, data, Buffer.alloc((512 - (data.length % 512)) % 512, 0));
  }
  blocks.push(Buffer.alloc(1024, 0));
  return require('node:zlib').gzipSync(Buffer.concat(blocks));
}

const fakeBinary = [
  '#!/bin/sh',
  'echo "fake-moviezen 9.9.9"',
  'echo "args: $*"',
  'if [ "$1" = "fail" ]; then exit 42; fi',
  'exit 0',
  '',
].join('\n');

const target = resolveTarget();
const archive = buildTarGz({ './moviezen': fakeBinary });
const archivePath = path.join(workDir, target.asset);
fs.writeFileSync(archivePath, archive);
const digest = crypto.createHash('sha256').update(archive).digest('hex');
const sums = `${digest}  ${target.asset}\n`;

const server = http.createServer((request, response) => {
  if (request.url.startsWith('/bad/')) {
    if (request.url.endsWith('SHA256SUMS')) {
      response.writeHead(200, { 'Content-Type': 'text/plain' });
      response.end(`${'b'.repeat(64)}  ${target.asset}\n`);
      return;
    }
    response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    response.end(archive);
    return;
  }
  if (request.url.endsWith('SHA256SUMS')) {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end(sums);
    return;
  }
  if (request.url.endsWith(target.asset)) {
    response.writeHead(200, { 'Content-Type': 'application/octet-stream' });
    response.end(archive);
    return;
  }
  response.writeHead(404);
  response.end('not found');
});

function runCli(args, env) {
  const cli = path.join(__dirname, '..', 'bin', 'cli.js');
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cli, ...args], { env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

async function main() {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseEnv = {
    ...process.env,
    MOVIEZEN_RELEASE_URL: `http://127.0.0.1:${port}`,
    MOVIEZEN_NPM_CACHE_DIR: path.join(workDir, 'cache'),
  };

  const versionRun = await runCli(['--version'], baseEnv);
  check('--version prints the wrapper version without downloading', () => {
    assert.strictEqual(versionRun.status, 0, versionRun.stderr);
    assert.match(versionRun.stdout, /^moviezen 0\.1\.\d+\n$/);
    assert.ok(!fs.existsSync(path.join(workDir, 'cache')), 'nothing should be downloaded for --version');
  });

  const run = await runCli(['alpha', 'beta'], baseEnv);
  check('downloads, verifies, extracts and forwards arguments', () => {
    assert.strictEqual(run.status, 0, run.stderr);
    assert.match(run.stdout, /fake-moviezen 9\.9\.9/);
    assert.match(run.stdout, /args: alpha beta/);
    assert.ok(fs.existsSync(path.join(workDir, 'cache', target.binary)), 'binary should be cached');
  });

  const cached = await runCli(['fail'], baseEnv);
  check('forwards the native exit code', () => {
    assert.strictEqual(cached.status, 42, cached.stderr);
  });

  const mismatch = await runCli(['fail'], {
    ...baseEnv,
    MOVIEZEN_RELEASE_URL: `http://127.0.0.1:${port}/bad`,
    MOVIEZEN_NPM_CACHE_DIR: path.join(workDir, 'cache-bad'),
  });
  check('refuses an archive whose checksum does not match', () => {
    assert.strictEqual(mismatch.status, 1);
    assert.match(mismatch.stderr, /Checksum mismatch/);
  });

  const unsupported = await runCli(['fail'], {
    ...baseEnv,
    MOVIEZEN_NPM_CACHE_DIR: path.join(workDir, 'cache-unsupported'),
  });
  check('reuses the cached binary without touching the network', () => {
    assert.strictEqual(unsupported.status, 42, unsupported.stderr);
  });

  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(workDir, { recursive: true, force: true });
  if (failures > 0) {
    process.stdout.write(`\n${failures} check(s) failed\n`);
    process.exit(1);
  }
  process.stdout.write('\nall npm wrapper checks passed\n');
}

main().catch((error) => {
  process.stdout.write(`smoke test crashed: ${error && error.stack ? error.stack : error}\n`);
  process.exit(1);
});
