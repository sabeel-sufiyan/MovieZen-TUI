'use strict';

/**
 * Platform matrix for the MovieZen-TUI release assets.
 *
 * Every entry here maps to an archive that the release workflow actually
 * produces. Architectures without a verified build are rejected instead of
 * being guessed at.
 */

const ASSET_PREFIX = 'MovieZen_';

const TARGETS = [
  {
    key: 'linux-x64',
    platform: 'linux',
    arch: 'x64',
    asset: `${ASSET_PREFIX}Linux_x64.tar.gz`,
    binary: 'moviezen',
    kind: 'tar.gz',
  },
  {
    key: 'linux-arm64',
    platform: 'linux',
    arch: 'arm64',
    asset: `${ASSET_PREFIX}Linux_arm64.tar.gz`,
    binary: 'moviezen',
    kind: 'tar.gz',
  },
  {
    key: 'macos-universal',
    platform: 'darwin',
    arch: ['x64', 'arm64'],
    asset: `${ASSET_PREFIX}macOS_Universal.tar.gz`,
    binary: 'moviezen',
    kind: 'tar.gz',
  },
  {
    key: 'windows-x64',
    platform: 'win32',
    arch: 'x64',
    asset: `${ASSET_PREFIX}Windows_x64.zip`,
    binary: 'moviezen.exe',
    kind: 'zip',
  },
  {
    key: 'windows-arm64',
    platform: 'win32',
    arch: 'arm64',
    asset: `${ASSET_PREFIX}Windows_arm64.zip`,
    binary: 'moviezen.exe',
    kind: 'zip',
  },
  {
    key: 'android-arm64',
    platform: 'android',
    arch: 'arm64',
    asset: `${ASSET_PREFIX}Android_arm64.tar.gz`,
    binary: 'moviezen',
    kind: 'tar.gz',
  },
];

function isTermux() {
  return Boolean(process.env.TERMUX_VERSION) || process.env.PREFIX === '/data/data/com.termux/files/usr';
}

/**
 * Resolve the release asset for a platform/architecture pair.
 * @param {string} [platform]
 * @param {string} [arch]
 * @returns {{key: string, asset: string, binary: string, kind: string}}
 */
function resolveTarget(platform = process.platform, arch = process.arch) {
  let effectivePlatform = platform;
  if (platform === 'linux' && isTermux()) {
    effectivePlatform = 'android';
  }

  const match = TARGETS.find(
    (target) =>
      target.platform === effectivePlatform &&
      (Array.isArray(target.arch) ? target.arch.includes(arch) : target.arch === arch),
  );

  if (!match) {
    const supported = TARGETS.map((t) => `${t.platform}/${[].concat(t.arch).join('|')}`).join(', ');
    const error = new Error(
      `MovieZen-TUI has no verified build for ${platform}/${arch}. ` +
        `Supported targets: ${supported}. ` +
        'Build from source instead: https://github.com/sabeel-sufiyan/MovieZen-TUI#build-from-source',
    );
    error.code = 'MOVIEZEN_UNSUPPORTED_PLATFORM';
    throw error;
  }

  return { key: match.key, asset: match.asset, binary: match.binary, kind: match.kind };
}

module.exports = { TARGETS, resolveTarget, isTermux };
