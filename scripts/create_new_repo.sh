#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-/workspace/swarm-ai}"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -d "$TARGET_DIR/.git" ]; then
  echo "A git repository already exists at: $TARGET_DIR"
  exit 0
fi

mkdir -p "$TARGET_DIR"

rsync -a --exclude '.git' "$SOURCE_DIR/" "$TARGET_DIR/"

cd "$TARGET_DIR"
rm -rf .git

git init -b main
git add .
git commit -m "Initial commit: project bootstrap from .github template"

echo "Created new git repository at: $TARGET_DIR"
