#!/usr/bin/env bash
# Builds a self-contained Playground bundle: blueprint.json + plugin zip.
#
#   tools/build-playground-bundle.sh            -> dist/meetup-artwork-generator-playground.zip
#
# Run it locally with:
#   npx @wp-playground/cli server --blueprint=dist/meetup-artwork-generator-playground.zip
set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SLUG="$(basename "$PLUGIN_DIR")"
DIST="$PLUGIN_DIR/dist"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$DIST"

# 1. Plugin zip without development files (see .distignore).
EXCLUDES=()
while IFS= read -r line; do
	[[ -z "$line" || "$line" == \#* ]] && continue
	pattern="${line#/}"
	EXCLUDES+=( -x "$SLUG/$pattern" -x "$SLUG/$pattern/*" -x "*/$pattern" )
done < "$PLUGIN_DIR/.distignore"
EXCLUDES+=( -x "$SLUG/dist/*" )
( cd "$PLUGIN_DIR/.." && zip -rq "$WORK/$SLUG.zip" "$SLUG" "${EXCLUDES[@]}" )
cp "$WORK/$SLUG.zip" "$DIST/$SLUG.zip"

# 2. Bundle: same blueprint, but the plugin comes from inside the bundle.
python3 - "$PLUGIN_DIR/playground/blueprint.json" "$WORK/blueprint.json" "$SLUG" <<'PY'
import json, sys
source, target, slug = sys.argv[1:]
blueprint = json.load(open(source))
for step in blueprint["steps"]:
    if step.get("step") == "installPlugin":
        step["pluginData"] = {"resource": "bundled", "path": f"/{slug}.zip"}
json.dump(blueprint, open(target, "w"), indent="\t", ensure_ascii=False)
PY
( cd "$WORK" && zip -q "$DIST/meetup-artwork-generator-playground.zip" blueprint.json "$SLUG.zip" )

echo "Plugin: $DIST/$SLUG.zip"
echo "Bundle: $DIST/meetup-artwork-generator-playground.zip"
