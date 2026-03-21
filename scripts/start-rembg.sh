#!/bin/bash
# Start the rembg background removal server
# Uses u2net_cloth_seg model — removes person, keeps only clothing

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SCRIPT_DIR/../rembg-server"

if [ ! -d "$VENV_DIR" ]; then
  echo "Creating virtual environment..."
  python3 -m venv "$VENV_DIR"
  source "$VENV_DIR/bin/activate"
  pip install "rembg[cpu,cli]"
else
  source "$VENV_DIR/bin/activate"
fi

echo "Starting rembg server on port 7100..."
echo "Model: u2net_cloth_seg (clothing segmentation)"
echo ""
rembg s --port 7100
