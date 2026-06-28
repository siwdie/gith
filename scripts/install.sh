#!/usr/bin/env sh
set -eu

REPO_OWNER="siwdie"
REPO_NAME="gith"
BINARY_NAME="gith"
DEFAULT_BIN_DIR="${HOME}/.local/bin"

VERSION="latest"
BIN_DIR="${GITH_BIN_DIR:-$DEFAULT_BIN_DIR}"
FORCE="0"
PRINT_DOWNLOAD_URL="0"
DRY_RUN="0"
VERIFY_ONLY="0"

usage() {
  cat <<'USAGE'
Install gith from GitHub Releases.

Usage:
  install.sh [options]

Options:
  --version <tag>        Install a specific release tag, for example: v1.7.0
  --bin-dir <dir>        Install directory for the gith binary (default: ~/.local/bin)
  --force                Replace an existing binary if present
  --print-download-url   Print the resolved download URL and exit
  --dry-run              Print the resolved install plan without changing anything
  --verify-only          Download to a temporary file, verify checksum, and exit without installing
  --help, -h             Show this help message
USAGE
}

log() {
  printf '%s\n' "$*"
}

warn() {
  printf 'warning: %s\n' "$*" >&2
}

fail() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --version)
      [ "$#" -ge 2 ] || fail "missing value for --version"
      VERSION="$2"
      shift 2
      ;;
    --bin-dir)
      [ "$#" -ge 2 ] || fail "missing value for --bin-dir"
      BIN_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE="1"
      shift
      ;;
    --print-download-url)
      PRINT_DOWNLOAD_URL="1"
      shift
      ;;
    --dry-run)
      DRY_RUN="1"
      shift
      ;;
    --verify-only)
      VERIFY_ONLY="1"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "unknown argument: $1"
      ;;
  esac
done

if [ "$DRY_RUN" = "1" ] && [ "$VERIFY_ONLY" = "1" ]; then
  fail "--dry-run and --verify-only cannot be used together"
fi

need_cmd uname
need_cmd chmod
need_cmd mkdir
need_cmd mv
need_cmd rm
need_cmd sed
need_cmd grep
need_cmd head
need_cmd mktemp
need_cmd awk

HTTP_CLIENT=""
if command -v curl >/dev/null 2>&1; then
  HTTP_CLIENT="curl"
elif command -v wget >/dev/null 2>&1; then
  HTTP_CLIENT="wget"
else
  fail "curl or wget is required"
fi

fetch() {
  url="$1"
  if [ "$HTTP_CLIENT" = "curl" ]; then
    curl -fsSL "$url"
  else
    wget -qO- "$url"
  fi
}

download_to() {
  url="$1"
  out="$2"
  if [ "$HTTP_CLIENT" = "curl" ]; then
    curl -fsSL "$url" -o "$out"
  else
    wget -qO "$out" "$url"
  fi
}

sha256_file() {
  file="$1"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$file" | awk '{print $1}'
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    fail "no SHA-256 tool found; install sha256sum or shasum"
  fi
}

normalize_os() {
  case "$(uname -s)" in
    Darwin) printf 'macos' ;;
    Linux) printf 'linux' ;;
    *) fail "unsupported operating system: $(uname -s)" ;;
  esac
}

normalize_arch() {
  case "$(uname -m)" in
    arm64|aarch64) printf 'arm64' ;;
    x86_64|amd64) printf 'x64' ;;
    *) fail "unsupported architecture: $(uname -m)" ;;
  esac
}

resolve_asset_suffix() {
  os="$1"
  arch="$2"

  case "$os-$arch" in
    macos-arm64) printf 'macos-arm64' ;;
    linux-x64) printf 'linux-x64' ;;
    *) fail "no standalone binary available for $os-$arch" ;;
  esac
}

resolve_tag() {
  if [ "$VERSION" != "latest" ]; then
    printf '%s' "$VERSION"
    return
  fi

  api_url="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest"
  tag=$(fetch "$api_url" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -n 1)

  [ -n "$tag" ] || fail "could not resolve latest release tag from GitHub API"
  printf '%s' "$tag"
}

extract_asset_digest() {
  api_url="$1"
  asset_name="$2"

  fetch "$api_url" | awk -v asset="$asset_name" '
    BEGIN {
      found = 0
    }
    /"name":/ {
      line = $0
      sub(/^.*"name":[[:space:]]*"/, "", line)
      sub(/".*$/, "", line)
      found = (line == asset)
      next
    }
    found && /"digest":/ {
      line = $0
      sub(/^.*"digest":[[:space:]]*"/, "", line)
      sub(/".*$/, "", line)
      print line
      exit
    }
  '
}

verify_download() {
  file="$1"
  expected_digest="$2"
  asset_name="$3"

  if [ -n "${expected_digest:-}" ]; then
    case "$expected_digest" in
      sha256:*)
        EXPECTED_SHA=${expected_digest#sha256:}
        ACTUAL_SHA=$(sha256_file "$file")
        [ "$ACTUAL_SHA" = "$EXPECTED_SHA" ] || fail "checksum verification failed for ${asset_name}"
        log "Checksum verified"
        ;;
      *)
        warn "unsupported digest format returned by GitHub: ${expected_digest}"
        ;;
    esac
  else
    warn "could not resolve asset digest from GitHub API; skipping checksum verification"
  fi
}

is_in_path() {
  case ":$PATH:" in
    *":$1:"*) return 0 ;;
    *) return 1 ;;
  esac
}

OS=$(normalize_os)
ARCH=$(normalize_arch)
ASSET_SUFFIX=$(resolve_asset_suffix "$OS" "$ARCH")
TAG=$(resolve_tag)
ASSET_NAME="${BINARY_NAME}-${TAG}-${ASSET_SUFFIX}"
DOWNLOAD_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${TAG}/${ASSET_NAME}"
RELEASE_API_URL="https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/tags/${TAG}"
TARGET_PATH="${BIN_DIR}/${BINARY_NAME}"

if [ "$PRINT_DOWNLOAD_URL" = "1" ]; then
  printf '%s\n' "$DOWNLOAD_URL"
  exit 0
fi

if [ "$DRY_RUN" = "1" ]; then
  log "Dry run enabled; no changes will be made."
  log ""
  log "Resolved platform: ${OS}-${ARCH}"
  log "Resolved tag: ${TAG}"
  log "Resolved asset: ${ASSET_NAME}"
  log "Download URL: ${DOWNLOAD_URL}"
  log "Target path: ${TARGET_PATH}"

  if [ -e "$TARGET_PATH" ]; then
    if [ "$FORCE" = "1" ]; then
      log "Existing binary would be replaced (--force)"
    else
      log "Existing binary found; installation would fail without --force"
    fi
  else
    log "Target path does not exist; binary would be installed"
  fi

  if is_in_path "$BIN_DIR"; then
    log "${BIN_DIR} is already in PATH"
  else
    log "${BIN_DIR} is not in PATH"
    log "Add this to your shell profile:"
    log "  export PATH=\"${BIN_DIR}:\$PATH\""
  fi

  exit 0
fi

TMP_DIR=$(mktemp -d 2>/dev/null || mktemp -d -t gith-install)
trap 'rm -rf "$TMP_DIR"' EXIT INT TERM

TMP_FILE="${TMP_DIR}/${BINARY_NAME}"

if [ "$VERIFY_ONLY" = "1" ]; then
  log "Verify-only mode enabled; no installation will be performed."
  log "Downloading ${DOWNLOAD_URL}"
  download_to "$DOWNLOAD_URL" "$TMP_FILE" || fail "failed to download release asset: ${ASSET_NAME}"

  EXPECTED_DIGEST=$(extract_asset_digest "$RELEASE_API_URL" "$ASSET_NAME" || true)
  verify_download "$TMP_FILE" "${EXPECTED_DIGEST:-}" "$ASSET_NAME"

  log ""
  log "Verified ${ASSET_NAME} successfully"
  log "Temporary file will be removed automatically"
  exit 0
fi

if [ -e "$TARGET_PATH" ] && [ "$FORCE" != "1" ]; then
  fail "${TARGET_PATH} already exists; rerun with --force to replace it"
fi

log "Installing ${BINARY_NAME} ${TAG} for ${OS}-${ARCH}..."
log "Downloading ${DOWNLOAD_URL}"

download_to "$DOWNLOAD_URL" "$TMP_FILE" || fail "failed to download release asset: ${ASSET_NAME}"

EXPECTED_DIGEST=$(extract_asset_digest "$RELEASE_API_URL" "$ASSET_NAME" || true)
verify_download "$TMP_FILE" "${EXPECTED_DIGEST:-}" "$ASSET_NAME"

chmod +x "$TMP_FILE"
mkdir -p "$BIN_DIR"
mv "$TMP_FILE" "$TARGET_PATH"

log ""
log "Installed to ${TARGET_PATH}"

if is_in_path "$BIN_DIR"; then
  log "${BIN_DIR} is already in PATH"
else
  log "${BIN_DIR} is not in PATH"
  log "Add this to your shell profile:"
  log "  export PATH=\"${BIN_DIR}:\$PATH\""
fi

log ""
log "Run '${BINARY_NAME} --help' to get started."