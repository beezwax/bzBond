#!/bin/bash

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
fi

sudo "$NODE_PATH" /var/www/bzbond-server/scripts/install-microbond.js "$1" "$2"
