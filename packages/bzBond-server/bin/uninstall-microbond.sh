#!/bin/bash

echo "======================================"
echo "bzBond Server Microbond Uninstallation"
echo "======================================"

# Run uninstall script
sudo "$NODE_PATH" /var/www/bzbond-server/scripts/uninstall-microbond.js "$1"