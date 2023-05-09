#!/bin/bash

# Check for proxy switch
while getopts ":n:x:" opt; do
  case $opt in
    n) NAME="$OPTARG"
    ;;
    x) PROXY="$OPTARG"
    ;;
  esac
done

if [ -z "$NAME" ]; then
  NAME=$1
fi
if [ -z "$PROXY" ]; then
  PROXY=$2
fi

echo "======================================"
echo "bzBond Server Microbond Uninstallation"
echo "======================================"

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
fi

# Run uninstall script
sudo "$NODE_PATH" /var/www/bzbond-server/scripts/uninstall-microbond.js  -n "$NAME" -x "$PROXY"