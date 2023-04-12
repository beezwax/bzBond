#!/bin/bash

echo "=========================="
echo "bzBond Server Update"
echo "=========================="
echo "Updating..."

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

# Backup microbonds
cd /var/www/bzbond-server || exit
sudo cp microbonds.js microbonds.js.bak

# Download latest version
echo "Downloading latest version..."
cd /tmp || exit
git clone https://github.com/beezwax/bzBond.git || exit

# Update to latest version
sudo cp -rf /tmp/bzBond/packages/bzBond-server/* /var/www/bzbond-server
cd /var/www/bzbond-server || exit
if [ -z "$1" ]; then
  sudo "$NODE_PATH" "$NPM_PATH" install
else
  echo "Updating with proxy $PROXY"
  sudo "$NODE_PATH" "$NPM_PATH" --proxy $PROXY install
fi
rm -rf /tmp/bzBond

# Restore microbonds
mv -f microbonds.js.bak microbonds.js

# Restart service
echo "Restarting service..."
if [ "$(uname)" = "Darwin" ]; then
  sudo launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  sudo launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  sudo systemctl restart bzbond-server
fi
echo "Service restarted"
echo "bzBond Server updated"