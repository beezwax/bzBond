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

# Handle running as root
if [ "$USER" = "root" ]; then
  COMMAND_PREFIX=""
else
  COMMAND_PREFIX="sudo "
fi

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
${COMMAND_PREFIX}git pull || (echo "Not a git repository" && exit)
if [ -z "$PROXY" ]; then
  ${COMMAND_PREFIX}"$NODE_PATH" "$NPM_PATH" install || (echo "Could not update dependencies" && exit)
else
  echo "Installing with proxy $PROXY"
  ${COMMAND_PREFIX}"$NODE_PATH" "$NPM_PATH" --proxy $PROXY install || (echo "Could not update dependencies" && exit)
fi

echo "Restarting service..."
if [ "$(uname)" = "Darwin" ]; then
  ${COMMAND_PREFIX}launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  ${COMMAND_PREFIX}launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  ${COMMAND_PREFIX}systemctl restart bzbond-server
fi
echo "Service restarted"