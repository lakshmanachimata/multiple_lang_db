#!/usr/bin/env bash
# Install PostgreSQL and MongoDB on macOS and run them in the background (Homebrew).
set -e

echo "=== Checking Homebrew ==="
if ! command -v brew &>/dev/null; then
  echo "Homebrew is not installed. Install from https://brew.sh"
  exit 1
fi

echo "=== Installing MongoDB Community ==="
brew tap mongodb/brew 2>/dev/null || true
brew install mongodb-community

echo "=== Installing PostgreSQL ==="
brew install postgresql@16

echo "=== Starting MongoDB in background ==="
brew services start mongodb-community

echo "=== Starting PostgreSQL in background ==="
brew services start postgresql@16

echo ""
echo "Done. Both services run in the background (launchd)."
echo ""
echo "Useful commands:"
echo "  brew services list              # see status"
echo "  brew services stop mongodb-community"
echo "  brew services stop postgresql@16"
echo "  brew services restart mongodb-community"
echo "  brew services restart postgresql@16"
echo ""
echo "MongoDB:  mongodb://localhost:27017  (no auth by default)"
echo "PostgreSQL:  localhost:5432  (create user/db with: createuser, createdb)"
