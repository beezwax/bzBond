#!/bin/bash

# Check for proxy switch
while getopts ":x:" opt; do
  case $opt in
    x) PROXY="$OPTARG"
    ;;
  esac
done

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
NPM_PATH="/opt/FileMaker/FileMaker Server/node/bin/npm"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
  NPM_PATH="/Library/FileMaker Server/node/bin/npm"
fi

cd "/var/www/bzbond-server/installed-microbonds/$1" || exit
echo "Updating $1"
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
