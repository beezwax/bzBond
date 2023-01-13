# bzbond-server

# Introduction

bzbond-server is a microservice that runs on your Claris/FileMaker server and
allows you to run JavaScript code. It is intended to be accessed through the
bzBond relay script in the mode `PERFORM_JAVASCRIPT` only when the script is
running on the server.

# Installation

These installations assume a default installation of Claris/FileMaker Server
on the specified platform.

If you are using macOS or Linux, you can use the following command to install
bzbond-server:

    $ curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash

Or using `wget`

    $ wget -qO- curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash

## Manual Installation: Ubuntu and macOS

1. Download a ZIP with the repo using [this
   link](https://github.com/beezwax/bzBond/archive/refs/heads/main.zip)
1. Unzip the repository and copy the files inside the `./packages/bzBond/dist/` directory into `/var/www/bzbond-server`
1. Ensure `root` is the owner and group for the directory and its contents
   (`chown -R root:root /var/www/bzbond-server`)
1. Ensure the permissions are rwxr-xr-x for the directory and its contents (755) (`chmod -R 755 /var/www/bzbond-server`)

### Ubuntu

1. Create the following file in `/lib/systemd/system/bzbond-server.service`

```
[Unit]
Description=bzbond-server – JavaScript microservice for FileMaker Server
Documentation=https://github.com/beezwax/bzbond
After=network.target

[Service]
Type=simple
User=fmserver
ExecStart="/opt/FileMaker/FileMaker Server/node/bin/node" /var/www/bzbond-server/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

2. Run the command `sudo systemctl daemon-reload` to refresh systemd
3. Launch bzbond-server with the command `sudo systemctl start bzbond-server`
4. Test the bzbond-server is running with the command `curl http://localhost:8999` this should output `{"message":"Route GET:/ not found","error":"Not Found","statusCode":404}`
5. Check the status of bzbond-server with the command `sudo systemctl status bzbond-server`
6. Ensure bzbond-server starts with the system with the command `sudo systemctl enable bzbond-server`

1: [https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/](https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/)

### macOS

1. Create the following file in `/Library/LaunchDaemons/net.beezwax.bzbond-server.plist`

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>net.beezwax.bzbond-server</string>

    <key>ProgramArguments</key>
    <array>
      <string>/Library/FileMaker Server/node/bin/node</string>
      <string>/var/www/bzbond-server/index.js</string>
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
```

2. Load the daemon with `launchctl load /Library/LaunchDaemons/net.beezwax.bzbond-server.plist`
3. Launch bzbond-server with the command `launchctl start net.beezwax.bzbond-server`
4. Test the bzbond-server is running with the command `curl http://localhost:8999` this should output `{"message":"Route GET:/ not found","error":"Not Found","statusCode":404}`

## Windows Server Installation

Coming soon

# Uninstall

If you are using macOS or Linux, you can use the following command to uninstall
bzbond-server:

    $ curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.sh | bash

Or using `wget`

    $ wget -qO- curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.sh | bash

## Manual uninstall: macOS

```
rm -rf /tmp/bzBond
sudo rm -rf /var/www/bzbond-server
sudo launchctl remove net.beezwax.bzbond-server
sudo rm /Library/LaunchDaemons/net.beezwax.bzbond-server.plist
```

## Manual Uninstall: Ubuntu

```
rm -rf /tmp/bzBond
sudo rm -rf /var/www/bzbond-server
sudo systemctl stop bzbond-server
sudo systemctl disable bzbond-server
sudo rm /lib/systemd/system/bzbond-server.service
sudo systemctl daemon-reload
sudo systemctl reset-failed
```

# Build

To generate a new build into `./dist`, use:

    $ npm run build

# Logs

You can see the logs for bzBond server with `tail /var/log/bzbond-server` in
macOS and `journalctl -u bzbond-server.service` in Ubuntu.
