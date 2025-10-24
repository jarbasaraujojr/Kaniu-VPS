#!/usr/bin/env bash
set -euo pipefail

echo "==> build.sh started"
export DEBIAN_FRONTEND=noninteractive

# Basic packages
apt-get update -y
apt-get install -y --no-install-recommends curl ca-certificates gnupg lsb-release build-essential

# Install Node.js 20.x from NodeSource (LTS/current). This avoids relying on distro packages.
# Safer: download the setup script first, validate it's a shell script, then execute.
if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20.x (attempt via NodeSource)"
  TMP_SETUP="/tmp/nodesource_setup.sh"
  rm -f "$TMP_SETUP"
  if curl -fsSL -o "$TMP_SETUP" https://deb.nodesource.com/setup_20.x; then
    # Basic validation: must start with a shell shebang or contain "nodesource" marker
    if head -n1 "$TMP_SETUP" | grep -qE '^#!' || grep -qi "nodesource" "$TMP_SETUP"; then
      bash "$TMP_SETUP"
      apt-get install -y --no-install-recommends nodejs || true
    else
      echo "==> Downloaded NodeSource script does not look like a shell script. Falling back to distro package."
      apt-get install -y --no-install-recommends nodejs || true
    fi
    rm -f "$TMP_SETUP"
  else
    echo "==> Could not download NodeSource setup script. Falling back to distro package."
    apt-get install -y --no-install-recommends nodejs || true
  fi
else
  echo "==> Node already installed: $(node --version)"
fi

# Show versions
node --version || true
npm --version || true

# Build the frontend if present
if [ -d "/app/frontend" ]; then
  echo "==> Building frontend in /app/frontend"
  cd /app/frontend
  # Prefer npm ci when lockfile exists for reproducible installs
  if [ -f package-lock.json ]; then
    npm ci --no-audit --prefer-offline
  else
    npm install --no-audit --prefer-offline
  fi

  # Run the build (Next.js)
  if npm run | grep -q "build"; then
    npm run build
  else
    echo "==> No build script found in package.json; skipping build step"
  fi
else
  echo "==> No /app/frontend directory found — skipping frontend build"
fi

echo "==> build.sh finished"
