#!/bin/bash
# Download rclone Linux binary during Vercel build
# This runs as part of the build step so rclone is available at runtime

set -e

RCLONE_DIR="./bin"
RCLONE_BIN="$RCLONE_DIR/rclone"

# Skip if already exists (cached builds)
if [ -f "$RCLONE_BIN" ]; then
  echo "rclone binary already exists, skipping download"
  exit 0
fi

echo "Downloading rclone for Linux amd64..."
mkdir -p "$RCLONE_DIR"

curl -L -o /tmp/rclone.zip "https://downloads.rclone.org/rclone-current-linux-amd64.zip"
unzip -o /tmp/rclone.zip -d /tmp/rclone-extract
cp /tmp/rclone-extract/rclone-*/rclone "$RCLONE_BIN"
chmod +x "$RCLONE_BIN"
rm -rf /tmp/rclone.zip /tmp/rclone-extract

echo "rclone installed to $RCLONE_BIN ($(du -h $RCLONE_BIN | cut -f1))"
