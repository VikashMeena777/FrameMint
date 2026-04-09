#!/usr/bin/env bash
# decode-rclone.sh — Decode RCLONE_CONFIG_BASE64 for local development
# Usage: source ./scripts/decode-rclone.sh
#
# This script reads the RCLONE_CONFIG_BASE64 env var (from .env.local),
# decodes it, and writes it to /tmp/.rclone/rclone.conf so that
# lib/storage/gdrive.ts can find it during local development.

set -euo pipefail

CONFIG_DIR="/tmp/.rclone"
CONFIG_FILE="${CONFIG_DIR}/rclone.conf"

# Check if env var exists
if [ -z "${RCLONE_CONFIG_BASE64:-}" ]; then
  echo "❌ RCLONE_CONFIG_BASE64 is not set."
  echo "   Add it to your .env.local file."
  echo ""
  echo "   To generate it:"
  echo "     base64 -w0 ~/.config/rclone/rclone.conf"
  exit 1
fi

# Create directory
mkdir -p "${CONFIG_DIR}"

# Decode and write
echo "${RCLONE_CONFIG_BASE64}" | base64 -d > "${CONFIG_FILE}"
chmod 600 "${CONFIG_FILE}"

echo "✅ rclone config decoded to ${CONFIG_FILE}"
echo "   Remote(s) available:"
grep '^\[' "${CONFIG_FILE}" | sed 's/\[//;s/\]//' | while read -r remote; do
  echo "   - ${remote}"
done
