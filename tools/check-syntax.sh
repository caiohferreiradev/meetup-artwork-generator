#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
while IFS= read -r -d '' file; do php -l "$file"; done < <(find . -path './node_modules' -prune -o -path './dist' -prune -o -name '*.php' -type f -print0)
while IFS= read -r -d '' file; do node --check "$file"; done < <(find assets/js tests -name '*.js' -type f -print0)
