#!/usr/bin/env bash
# Keep the existing gate entry point; the scanner owns occurrence-level exceptions.
cd "$(dirname "$0")/.." || exit 1
exec python3 scripts/check-brand.py
