#!/usr/bin/env bash
# Fails if brand names or personal paths appear in shipped sources. CSS `linear` easing/gradients and the repo URL are allowed.
cd "$(dirname "$0")/.." || exit 1
hits=$(grep -rniE "lamina|meridian|\bvelo\b|claude|github|linear\b|/Users/tanho|/private/tmp" atoms docs scripts README.md -I \
  | grep -v "scripts/check-brand.sh" \
  | grep -viE "\.linear\(duration:|linear-gradient|linear[)'\",]|'linear|linear light|linear scale|linear-ish|s linear |civicsense2025|a git install|\.github/workflows/")
if [ -n "$hits" ]; then echo "$hits" | cut -c1-200; echo "check-brand: found brand words"; exit 1; fi
echo "check-brand: clean"
