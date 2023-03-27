#!/bin/bash

echo "======================================"
echo "bzBond Server Microbond Uninstallation"
echo "======================================"

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
fi

# Run uninstall script
sudo "$NODE_PATH" /var/www/bzbond-server/scripts/uninstall-microbond.js "$1"