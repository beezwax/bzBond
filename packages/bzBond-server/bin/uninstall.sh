#!/bin/bash

echo "=========================="
echo "bzBond Server Installation"
echo "=========================="
echo "Uninstalling..."

echo "Removing temporary files..."
rm -rf /tmp/bzBond

echo "Removing bzbond-server files...."
sudo rm -rf /var/www/bzbond-server

# Ubuntu uninstall
echo "Removing daemon..."
if [ "$(uname)" = "Darwin" ]; then
  sudo launchctl remove net.beezwax.bzbond-server
  sudo rm /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  sudo systemctl stop bzbond-server
  sudo systemctl disable bzbond-server
  sudo rm /lib/systemd/system/bzbond-server.service
  sudo systemctl daemon-reload
  sudo systemctl reset-failed
fi

echo "bzBond server uninstalled!"
