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

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
NPM_PATH="/opt/FileMaker/FileMaker Server/node/bin/npm"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
  NPM_PATH="/Library/FileMaker Server/node/bin/npm"
fi

cd "/var/www/bzbond-server/installed-microbonds/$NAME" || exit
echo "Updating $NAME"
sudo git pull || (echo "Not a git repository" && exit)
if [ -z "$PROXY" ]; then
  sudo "$NODE_PATH" "$NPM_PATH" install || (echo "Could not update dependencies" && exit)
else
  echo "Installing with proxy $PROXY"
  sudo "$NODE_PATH" "$NPM_PATH" --proxy $PROXY install || (echo "Could not update dependencies" && exit)
fi

if [ "$(uname)" = "Darwin" ]; then
  sudo launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  sudo launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  sudo systemctl restart bzbond-server
fi
