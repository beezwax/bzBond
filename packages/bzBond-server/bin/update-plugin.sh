#!/bin/bash

cd "/var/www/bzbond-server/installed-plugins/$1" || exit
echo "Updating $1"
sudo git pull || (echo "Not a git repository" && exit)

if [ "$(uname)" = "Darwin" ]; then
  sudo launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  sudo launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  sudo systemctl restart bzbond-server
fi
