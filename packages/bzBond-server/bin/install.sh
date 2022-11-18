#!/bin/bash

echo "=========================="
echo "bzBond Server Installation"
echo "=========================="

if ! id fmserver &>/dev/null; then
  echo "ERROR: The 'fmserver' user was not found in this system."
  echo "Nothing was installed."
  exit
fi

NODE_PATH="/opt/FileMaker/FileMaker Server/node/bin/node"
# For testing
# NODE_PATH=$(which node)
if ! command -v "$NODE_PATH" &> /dev/null; then
  echo "ERROR: Could not find node binary at '$NODE_PATH'."
  echo "Nothing was installed."
  exit
fi

cd /tmp
git clone https://github.com/beezwax/bzBond.git
sudo mkdir -p /var/www/bzbond-server
sudo cp -r /tmp/bzBond/packages/bzBond-server/dist/* /var/www/bzbond-server
rm -rf /tmp/bzBond
sudo chown -R root:root /var/www/bzbond-server
sudo chmod -R 755 /var/www/bzbond-server

# Ubuntu installation
sudo tee -a /lib/systemd/system/bzbond-server.service &> /dev/null <<EOF
[Unit]
Description=bzbond-server – JavaScript microservice for FileMaker Server
Documentation=https://github.com/beezwax/bzbond
After=network.target

[Service]
Type=simple
User=fmserver
ExecStart="$NODE_PATH" /var/www/bzbond-server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start bzbond-server
sudo systemctl enable bzbond-server

echo "bzBond server installed!"
echo "Use 'sudo systemctl status bzbond-server' to check its status"
