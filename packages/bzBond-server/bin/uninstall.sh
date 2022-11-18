#!/bin/bash

echo "=========================="
echo "bzBond Server Installation"
echo "=========================="
echo "Uninstalling..."

echo "Removing temporary files..."
rm -rf /tmp/bzBond

echo "Removing bzbond-server files...."
sudo rm -rf /var/www/bzbond-server

echo "Removing daemon..."
sudo systemctl stop bzbond-server
sudo systemctl disable bzbond-server
sudo rm /lib/systemd/system/bzbond-server.service
sudo systemctl daemon-reload
sudo systemctl reset-failed

echo "bzBond server uninstalled!"
