#!/bin/bash

echo "=========================="
echo "bzBond Server Installation"
echo "=========================="
echo "Uninstalling..."

# Handle command prefix for root user
USER=$(whoami)
if [ "$USER" = "root" ]; then
  COMMAND_PREFIX=""
else
  COMMAND_PREFIX="sudo "
fi

echo "Removing temporary files..."
rm -rf /tmp/bzBond

echo "Removing bzbond-server files...."
${COMMAND_PREFIX}rm -rf /var/www/bzbond-server

echo "Removing daemon..."
if [ "$(uname)" = "Darwin" ]; then
  # macOS uninstall
  ${COMMAND_PREFIX}launchctl unload /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  ${COMMAND_PREFIX}launchctl remove /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  ${COMMAND_PREFIX}rm /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
else
  # Ubuntu uninstall
  ${COMMAND_PREFIX}systemctl stop bzbond-server
  ${COMMAND_PREFIX}systemctl disable bzbond-server
  ${COMMAND_PREFIX}rm /lib/systemd/system/bzbond-server.service
  ${COMMAND_PREFIX}systemctl daemon-reload
  ${COMMAND_PREFIX}systemctl reset-failed
fi

echo "bzBond server uninstalled!"
