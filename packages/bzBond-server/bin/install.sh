#!/bin/bash

# Installation process (tested on Ubuntu 18)
cd /tmp
git clone https://github.com/beezwax/bzBond.git
sudo mkdir -p /var/www/bzbond-server
sudo cp -r /tmp/bzBond/packages/bzBond-server/dist/* /var/www/bzbond-server
rm -rf /tmp/bzBond
sudo chown -R root:root /var/www/bzbond-server
sudo chmod -R 755 /var/www/bzbond-server

# TODO: Replace this with FileMaker's node path
NODE_PATH=$(which node)

sudo tee -a /lib/systemd/system/bzbond-server.service <<EOF
[Unit]
Description=bzbond-server – JavaScript microservice for FileMaker Server
Documentation=https://github.com/beezwax/bzbond
After=network.target

[Service]
Type=simple
User=fmserver
ExecStart=$NODE_PATH /var/www/bzbond-server/index.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start bzbond-server
sudo systemctl enable bzbond-server

echo "bzBond server installed!"
echo "Use 'sudo systemctl status bzbond-server' to check its status"
