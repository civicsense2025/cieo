#!/usr/bin/env python3
"""Check shipped examples without letting an allowed token exempt its entire line."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
FORBIDDEN = re.compile(r"lamina|meridian|\bvelo\b|claude|github|linear\b|/Users/tanho|/private/tmp", re.IGNORECASE)
# Infrastructure paths and syntax are exact exceptions, not whole-line exemptions.
ALLOWED = re.compile(
    r"(?:https://github\.com/|github:)civicsense2025/(?:cieo|forma-gesso)(?=[#/'\"`\s]|$)"
    r"|\.github/workflows/[a-zA-Z0-9_-]+\.ya?ml\b"
    r"|\.github/pull_request_template\.md\b"
    r"|['\"]\.github/(?:\*\*/\*)?['\"]"
    r"|\.linear\(duration:|linear-gradient|['\"]linear['\"]"
    r"|linear(?=[)\"'])|linear light|linear scale|linear-ish|(?<=s )linear(?= )",
    re.IGNORECASE,
)

def main():
    hits = []
    for scope in ['atoms', 'docs', 'scripts', 'README.md']:
        entry = ROOT / scope
        files = sorted(entry.rglob('*')) if entry.is_dir() else [entry]
        for path in files:
            if not path.is_file() or path.name in {'check-brand.py', 'check-brand.sh'}:
                continue
            data = path.read_bytes()
            if b'\0' in data:
                continue
            for number, line in enumerate(data.decode('utf-8', errors='replace').splitlines(), 1):
                if FORBIDDEN.search(ALLOWED.sub('', line)):
                    hits.append(f"{path.relative_to(ROOT)}:{number}:{line[:200]}")
    if hits:
        print('\n'.join(hits))
        print('check-brand: found brand words')
        return 1
    print('check-brand: clean')
    return 0

if __name__ == '__main__':
    sys.exit(main())
