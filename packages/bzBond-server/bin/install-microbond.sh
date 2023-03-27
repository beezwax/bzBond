#!/bin/bash

# Check for proxy switch
while getopts ":n:u:x:" opt; do
  case $opt in
    n) NAME="$OPTARG"
    ;;
    u) URL="$OPTARG"
    ;;
    x) PROXY="$OPTARG"
    ;;
  esac
done

if [ -z "$NAME"]; then
  NAME=$1
fi
if [ -z "$URL"]; then
  URL=$2
fi
if [ -z "$PROXY"]; then
  PROXY=$3
fi

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
fi

sudo "$NODE_PATH" /var/www/bzbond-server/scripts/install-microbond.js -n "$NAME" -u "$URL" -x "$PROXY"