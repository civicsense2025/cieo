#!/usr/bin/env bash
# Fails when SwiftUI code animates on a SwiftUI default spring or a hand-timed curve instead of the Cieo presets.
# SwiftUI's .spring/.snappy/.bouncy overshoot (damping < 1), which the motion tokens rule out; use
# .motion(preset), withMotion(_:reduceMotion:), .motion(_:value:) or .motionAnimation(_:value:).
# A line that genuinely needs another curve says why with `// motion-ok: <reason>`.
# Usage: scripts/check-swift-motion.sh [file ...]   (default: Sources/CieoUI, Sources/CieoGallery and atoms/swift)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "$#" -gt 0 ]; then files=("$@"); else
  files=()
  while IFS= read -r f; do files+=("$f"); done < <(find Sources/CieoUI Sources/CieoGallery atoms/swift -name '*.swift' | sort)
fi

pattern='\.(spring|snappy|bouncy|smooth|interactiveSpring)\b|(animation|withAnimation)\(\.default\b'
pattern+='|\.(easeInOut|easeIn|easeOut|linear)\b'          # with or without a duration
pattern+='|\.(interpolatingSpring|timingCurve)\('            # hand-tuned springs and curves
pattern+='|\.delay\([0-9]*\.?[0-9]+\)'                       # single literal delays; staggers (+ Double(i) * …) are tracked separately

# grep exits 1 for "no match" and 2 for an error; only 1 means clean.
set +e
raw=$(grep -HnE "$pattern" "${files[@]}"); status=$?
hits=$(printf '%s\n' "$raw" | grep -v 'motion-ok' | grep -vE '^\S+:[0-9]+:\s*//' | grep -v '^$')
set -e
if [ "$status" -gt 1 ]; then echo "check-swift-motion: grep failed (status $status)"; exit 2; fi
if [ -n "$hits" ]; then
  echo "Raw SwiftUI motion (use the Cieo spring presets instead):"
  echo "$hits"
  exit 1
fi
echo "Swift motion: ${#files[@]} files on Cieo presets."
