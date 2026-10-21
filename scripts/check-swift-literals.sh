#!/usr/bin/env bash
# Fails when a SwiftUI component hard-codes a font, glyph, colour, spacing step, stroke or opacity.
# Components read those from the theme, typography, metrics and icons in the environment, so a host
# restyles every component from one place. Foundations define the defaults and are exempt.
# A line that genuinely needs a literal says why with `// literal-ok: <reason>`.
# Usage: scripts/check-swift-literals.sh [file ...]   (default: every component in Sources/CieoUI)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -gt 0 ]; then files=("$@"); else
  files=()
  while IFS= read -r f; do files+=("$f"); done < <(find Sources/CieoUI -name '*.swift' -not -path '*/Foundations/*' | sort)
fi

pattern='\.font\(\.(system|custom|largeTitle|title|title2|title3|headline|subheadline|body|callout|footnote|caption|caption2)\b'
pattern+='|Font\.(system|custom)\('
pattern+='|Image\(systemName:|systemImage:'
pattern+='|Color\.(red|green|blue|black|white|gray|orange|yellow|pink|purple)\b'
pattern+='|(foregroundStyle|fill|background|stroke|tint)\(\.(red|green|blue|black|white|gray|orange|yellow|primary|secondary|tertiary|quaternary)\b'
pattern+='|(spacing|lineWidth|cornerRadius|height|width|minHeight|minWidth): *[0-9]'
pattern+='|\.padding\((\.[a-z]+, *)?[0-9]'
pattern+='|opacity\(0?\.[0-9]'
pattern+='|Metrics\.(tight|compact|medium|standard|loose|section|corner|touchTarget)\b'

if hits=$(grep -HnE "$pattern" "${files[@]}" | grep -v 'literal-ok'); then
  echo "Hard-coded styling in components (read it from the environment instead):"
  echo "$hits"
  exit 1
fi
echo "No hard-coded styling in ${#files[@]} component files."
