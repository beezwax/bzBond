#!/bin/bash

echo "=========================="
echo "bzBond Server Installation"
echo "=========================="

USER=$(whoami)
echo "Installing for $USER"

# Check fmserver user exists
if ! id fmserver &>/dev/null; then
  echo "ERROR: The 'fmserver' user was not found in this system."
  echo "Nothing was installed."
  exit
fi

# Check bzbond is not already installed
BZBOND_DIR="/var/www/bzbond-server/"
if [ -d "$BZBOND_DIR" ]; then
  echo "bzBond is already installed"
  exit 1
fi

# Check FileMaker's node
NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
NPM_PATH="/opt/FileMaker/FileMaker Server/node/bin/npm"
if [ "$(uname)" = "Darwin" ]; then
  NODE_PATH="/Library/FileMaker Server/node/bin/node"
  NPM_PATH="/Library/FileMaker Server/node/bin/npm"
fi

if ! command -v "$NODE_PATH" &> /dev/null; then
  echo "ERROR: Could not find node binary at '$NODE_PATH'."
  echo "Nothing was installed."
  exit
fi

if ! command -v "$NPM_PATH" &> /dev/null; then
  echo "ERROR: Could not find npm binary at '$NPM_PATH'."
  echo "Nothing was installed."
  exit
fi

echo "Downloading latest version..."
cd /tmp || exit
git clone https://github.com/beezwax/bzBond.git
sudo mkdir -p /var/www/bzbond-server
sudo cp -r /tmp/bzBond/packages/bzBond-server/* /var/www/bzbond-server
sudo chmod -R 755 /var/www/bzbond-server

echo "Installing dependencies..."
cd /var/www/bzbond-server || exit
sudo "$NODE_PATH" "$NPM_PATH" install
rm -rf /tmp/bzBond

echo "Setting up services..."
if [ "$(uname)" = "Darwin" ]; then
  # macOS installation
  sudo chown -R "$USER" /var/www/bzbond-server

  sudo tee -a /Library/LaunchDaemons/net.beezwax.bzbond-server.plist &> /dev/null <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.beezwax.bzbond-server</string>

    <key>ProgramArguments</key>
    <array>
      <string>$NODE_PATH</string>
      <string>/var/www/bzbond-server/server.js</string>
    </array>

    <key>WorkingDirectory</key>
    <string>/var/www/bzbond-server</string>

    <key>StandardOutPath</key>
    <string>/var/log/bzbond-server/access.log</string>

    <key>StandardErrorPath</key>
    <string>/var/log/bzbond-server/error.log</string>

    <key>RunAtLoad</key>
    <true/>

    <key>KeepAlive</key>
    <true/>
  </dict>
</plist>
EOF

  sudo launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
  sudo chmod a+x /var/log/bzbond-server

  echo "bzBond server installed!"
else
  # Ubuntu installation
  sudo chown -R root:root /var/www/bzbond-server

  sudo tee -a /lib/systemd/system/bzbond-server.service &> /dev/null <<EOF
[Unit]
Description=bzbond-server – JavaScript microservice for FileMaker Server
Documentation=https://github.com/beezwax/bzbond
After=network.target

[Service]
Type=simple
User=fmserver
ExecStart="$NODE_PATH" /var/www/bzbond-server/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

  sudo systemctl daemon-reload
  sudo systemctl start bzbond-server
  sudo systemctl enable bzbond-server

  echo "bzBond server installed!"
  echo
  echo "Use 'sudo systemctl status bzbond-server' to check its status"
fi
