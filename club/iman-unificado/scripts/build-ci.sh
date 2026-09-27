#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm --prefix server ci --ignore-scripts
npm --prefix server test
npm --prefix server run build
python3 scripts/content_pipeline.py
python3 scripts/build.py
python3 scripts/check.py
python3 scripts/seo_audit.py
