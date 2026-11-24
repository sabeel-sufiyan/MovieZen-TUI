'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const https = require('node:https');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');

const REPO = 'sabeel-sufiyan/MovieZen-TUI';
const pkg = require('../package.json');

/** Root URL that hosts the release assets for this package version. */
function releaseBaseUrl(version = pkg.version) {
  const override = process.env.MOVIEZEN_RELEASE_URL;
  if (override) {
    return override.replace(/\/+$/, '');
  }
  return `https://github.com/${REPO}/releases/download/v${version}`;
}

/** Directory the native binary is unpacked into. */
function binaryDir(version = pkg.version) {
  if (process.env.MOVIEZEN_NPM_CACHE_DIR) {
    return process.env.MOVIEZEN_NPM_CACHE_DIR;
  }
  if (process.platform === 'win32' && process.env.LOCALAPPDATA) {
    return path.join(process.env.LOCALAPPDATA, 'MovieZen-TUI', 'npm', `v${version}`);
  }
  const base =
    process.env.XDG_CACHE_HOME && process.env.XDG_CACHE_HOME.trim()
      ? process.env.XDG_CACHE_HOME
      : path.join(os.homedir(), '.cache');
  return path.join(base, 'moviezen-tui', 'npm', `v${version}`);
}

function fetchToFile(url, destination, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(
      url,
      {
        headers: {
          'User-Agent': `moviezen-tui-npm/${pkg.version}`,
          Accept: 'application/octet-stream',
        },
      },
      (response) => {
        const status = response.statusCode || 0;
        if (status >= 300 && status < 400 && response.headers.location) {
          response.resume();
          if (redirectsLeft <= 0) {
            reject(new Error(`Too many redirects while downloading ${url}`));
            return;
          }
          const next = new URL(response.headers.location, url).toString();
          fetchToFile(next, destination, redirectsLeft - 1).then(resolve, reject);
          return;
        }
        if (status !== 200) {
          response.resume();
          reject(new Error(`Download failed (HTTP ${status}) for ${url}`));
          return;
        }
        const sink = fs.createWriteStream(destination);
        response.pipe(sink);
        sink.on('finish', () => sink.close(() => resolve(destination)));
        sink.on('error', reject);
      },
    );
    request.on('error', reject);
    request.setTimeout(120000, () => request.destroy(new Error(`Timed out downloading ${url}`)));
  });
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

/** Parse a `SHA256SUMS` file into a map of file name -> lowercase hex digest. */
function parseChecksums(text) {
  const map = new Map();
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const match = /^([0-9a-fA-F]{64})\s+\*?(.+)$/.exec(line);
    if (match) {
      map.set(match[2].trim(), match[1].toLowerCase());
    }
  }
  return map;
}

/** Minimal ustar extractor: writes regular files flat into `destination`. */
function extractTarGz(archive, destination) {
  const buffer = zlib.gunzipSync(fs.readFileSync(archive));
  const written = [];
  let offset = 0;
  while (offset + 512 <= buffer.length) {
    const header = buffer.subarray(offset, offset + 512);
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, '');
    if (!name) break;
    const sizeField = header.subarray(124, 136).toString('utf8').replace(/\0.*$/, '').trim();
    const size = parseInt(sizeField || '0', 8) || 0;
    const type = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    if (type === '0' || type === '\0' || type === '48' || type === '7') {
      const fileName = path.basename(name.replace(/\/+$/, ''));
      if (fileName) {
        const target = path.join(destination, fileName);
        fs.writeFileSync(target, buffer.subarray(dataStart, dataStart + size));
        written.push(target);
      }
    }
    offset = dataStart + Math.ceil(size / 512) * 512;
  }
  return written;
}

function extractZip(archive, destination) {
  if (process.platform !== 'win32') {
    throw new Error('zip archives are only handled on Windows release builds');
  }
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Expand-Archive -LiteralPath '${archive}' -DestinationPath '${destination}' -Force`,
    ],
    { stdio: 'inherit' },
  );
  return fs.readdirSync(destination).map((entry) => path.join(destination, entry));
}

/**
 * Download, verify and unpack the native binary for this platform.
 * @returns {Promise<string>} absolute path to the executable
 */
async function installBinary(target, version = pkg.version) {
  const destination = binaryDir(version);
  const executable = path.join(destination, target.binary);
  if (fs.existsSync(executable)) {
    return executable;
  }

  fs.mkdirSync(destination, { recursive: true });
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'moviezen-npm-'));
  const archivePath = path.join(workDir, target.asset);
  const sumsPath = path.join(workDir, 'SHA256SUMS');

  try {
    const base = releaseBaseUrl(version);
    await fetchToFile(`${base}/SHA256SUMS`, sumsPath);
    const checksums = parseChecksums(fs.readFileSync(sumsPath, 'utf8'));
    const expected = checksums.get(target.asset);
    if (!expected) {
      throw new Error(`SHA256SUMS does not list ${target.asset}; refusing to install an unverified binary.`);
    }

    await fetchToFile(`${base}/${target.asset}`, archivePath);
    const actual = sha256File(archivePath);
    if (actual !== expected) {
      throw new Error(`Checksum mismatch for ${target.asset} (expected ${expected}, got ${actual}).`);
    }

    const extracted =
      target.kind === 'zip' ? extractZip(archivePath, workDir) : extractTarGz(archivePath, workDir);
    const source = extracted.find((file) => path.basename(file) === target.binary);
    if (!source) {
      throw new Error(`Archive ${target.asset} did not contain ${target.binary}.`);
    }

    const tempExecutable = path.join(destination, `.${target.binary}.tmp`);
    fs.copyFileSync(source, tempExecutable);
    fs.chmodSync(tempExecutable, 0o755);
    fs.renameSync(tempExecutable, executable);
    return executable;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

module.exports = {
  REPO,
  binaryDir,
  extractTarGz,
  fetchToFile,
  installBinary,
  parseChecksums,
  releaseBaseUrl,
  sha256File,
};
