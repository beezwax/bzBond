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

# Logs

You can see the logs for bzBond server with `tail /var/log/bzbond-server` in
macOS and `journalctl -u bzbond-server.service` in Ubuntu.

# Plugins

Plugins allow you to define custom endpoints in your bzBond node server.
Plugins are npm packages, so you can use any other package you need as you
usually would, with `npm install` from your plugin's directory.

## Installing plugins

After bzBond server is installed, you can run the following command from the
server:

    $ /var/www/bzbond-server/bin/install-plugin.sh

It will prompt for the plugin info and install it.

You can try the example plugin with:

    name: hello-world
    url: beezwax/bzbond-server-plugin-example

In the snippet above, it will use GitHub to find the given repository. You can
also pass a full git URL, or a path to a local git repository, such as
`/home/my-username/some-git-repo` or `../some-folder/my-git-repo`.

## Updating plugins

To update a plugin, you can run the following command from the server:

    $ /var/www/bzbond-server/bin/update-plugin.sh my-plugin-name

Automatic updates will work only if the plugin is a git repository. Otherwise,
you'll have to manually update it in the
`/var/www/bzbond-server/installed-plugins/my-plugin-name` folder.

You'll then need to restart the server. If using Ubuntu:

    $ sudo systemctl restart bzbond-server

For macOS:

    $ sudo launchctl stop net.beezwax.bzbond-server
    $ sudo launchctl start net.beezwax.bzbond-server

## Creating plugins

You can use the command below to set up a bare bones plugin for you to
customize:

    $ bash <(curl -s https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-plugin.sh)

Or using `wget`

    $ wget -qO- curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-plugin.sh | bash

Once your plugin is done, you'll have to install it following the instructions
above.

## Deleting plugins

For now, the process is manual:

1. `cd /var/www/bzbond-server`
1. Remove the `require` statement for the plugin you want to uninstall.
1. Remove the plugin definition from the `plugins` function.
1. `npm uninstall plugin-name` (alternatively, edit `package.json` and run `npm install`)
1. `sudo systemctl restart bzbond-server`

For example, if we want to remove the [hello-world](https://github.com/beezwax/bzbond-server-plugin-example) plugin, we transform this:

```javascript
const {
  plugin: helloWorldPlugin,
  options: helloWorldOptions,
} = require("hello-world");
const { plugin: anotherPlugin, options: anotherOptions } = require("another");
const plugins = async () => [
  // Do not change this file manually, use bzBond's `install-plugin` command
  { plugin: helloWorldPlugin, options: helloWorldOptions },
  { plugin: anotherPlugin, options: anotherOptions },
];
```

Into this:

```javascript
const { plugin: anotherPlugin, options: anotherOptions } = require("another");
const plugins = async () => [
  // Do not change this file manually, use bzBond's `install-plugin` command
  { plugin: anotherPlugin, options: anotherOptions },
];
```
