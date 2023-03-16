#!/bin/bash

cd "/var/www/bzbond-server/installed-plugins/$1" || exit
echo "Updating $1"
sudo git pull || (echo "Not a git repository" && exit)

if [ "$(uname)" = "Darwin" ]; then
  sudo launchctl stop net.beezwax.bzbond-server
  sudo launchctl start net.beezwax.bzbond-server
else
  sudo systemctl restart bzbond-server
fi
