# Introduction

bzBond-server is a microservice for [Claris/FileMaker Server](https://www.claris.com/filemaker/server/) that enables execution of JavaScript code. It also acts as a host for additional microservices, called Microbonds. 

# Table of contents

- [Installation](#installation)
  - [Installation on macOS/Linux](#installation-on-macoslinux)
  - [Installation on Windows Server](#installation-on-windows-server)
  - [Installation with a proxy on macOS/Linux](#installation-with-a-proxy-on-macoslinux)
  - [Installation with a proxy on Windows Server](#installation-with-a-proxy-on-windows-server)
  - [Installing a specific version](#installing-a-specific-version)
    - [Installing a specific version on macOS/Linux](#installing-a-specific-version-on-macoslinux)
    - [Installing a specific version on Windows Server](#installing-a-specific-version-on-windows-server)
- [Updating](#updating)
- [Usage](#usage)
- [Microbonds](#microbonds)
  - [Microbond installation](#microbond-installation)
    - [Microbond installation on macOS/Linux](#microbond-installation-on-macoslinux)
    - [Microbond installation on Windows Server](#microbond-installation-on-windows-server)
    - [Microbond installation with command line arguments](#microbond-installation-with-command-line-arguments)
      - [Example of Microbond installation command including name and source url on macOS/Linux](#example-of-microbond-installation-command-including-name-and-source-url-on-macoslinux)
      - [Example of Microbond installation command including name and source url on Windows Server](#example-of-microbond-installation-command-including-name-and-source-url-on-windows-server)
    - [Microbond installation local git repo url format](#microbond-installation-local-git-repo-url-format)
      - [Examples of local git report url format for Microbond Installation on macOS/Linux](#examples-of-local-git-repo-url-format-for-microbond-installation-on-macoslinux)
      - [Examples of local git report url format for Microbond Installation on Windows Server](#examples-of-local-git-repo-url-format-for-microbond-installation-on-windows-server)
    - [Microbond installation with a proxy on macOS/Linux](#microbond-installation-with-a-proxy-on-macoslinux)
    - [Microbond installation with a proxy on Windows Server](#microbond-installation-with-a-proxy-on-windows-server)
  - [Microbond update](#microbond-update)
    - [Microbond update on macOS/Linux](#microbond-update-on-macoslinux)
    - [Microbond update on Windows Server](#microbond-update-on-windows-server)
    - [Microbond update with a proxy on macOS/Linux](#microbond-update-with-a-proxy-on-macoslinux)
    - [Microbond update with a proxy on Windows Server](#microbond-update-with-a-proxy-on-windows-server)
  - [Microbond creation](#microbond-creation)
    - [Microbond creation on macOS/Linux](#microbond-creation-on-macoslinux)
    - [Microbond creation on Windows](#microbond-creation-on-windows)
    - [Microbond creation: Namespacing](#microbond-creation-namespacing)
  - [Microbond publishing](#microbond-publishing)
  - [Microbond uninstallation](#microbond-uninstallation)
    - [Microbond uninstallation on macOS/Linux](#microbond-uninstallation-on-macoslinux)
    - [Microbond uninstallation on Windows Server](#microbond-uninstallation-on-windows-server)
- [Logs](#logs)
  - [bzBond-server logs on macOS/Linux](#bzbond-server-logs-on-macoslinux)
    - [Viewing bzBond-server logs on macOS](#viewing-bzbond-server-logs-on-macos)
    - [Viewing bzBond-server logs on Linux](#viewing-bzbond-server-logs-on-linux)
  - [Viewing bzBond-server logs on Windows Server](#viewing-bzbond-server-logs-on-windows-server)
- [Uninstallation](#uninstallation)
  - [Uninstallation on macOS/Linux](#uninstallation-on-macoslinux)
  - [Uninstallation on Windows Server](#uninstallation-on-windows-server)

# Installation

These installations assume a default installation of Claris/FileMaker Server on the specified platform.

## Installation on macOS/Linux

On macOS or Linux use the following command to install bzBond-server:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash`

## Installation on Windows Server

**Note: Install [node](https://nodejs.org/en/download) and [git](https://git-scm.com/downloads) before installing bzBond-server.**

On Windows Server use the following command in PowerShell to install bzBond-server:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"`

## Installation with a proxy on macOS/Linux

On macOS/Linux reference the proxy in the installation command as follows:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash -s -- -x http://proxy.address.com:port#`

For example:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash -s -- -x http://proxy.example.com:443`

## Installation with a proxy on Windows Server

On Windows Server reference the proxy in the installation command as follows

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1" -Proxy http://proxy.address.com:port#`

For example:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1" -Proxy http://proxy.example.com:443`

## Installing a specific version

Sometimes for compatibility or testing reasons it is necessary to install a version of bzBond other than the latest.

### Installing a specific version on macOS/Linux

On macOS/Linux reference the version tag you want to install in the installation command as follows:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash -s -- -v v#.#.#`

For example:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash -s -- -v v0.9.47`

### Installing a specific version on Windows Server

On Windows Server reference the version tag you want to install in the installation command as follows:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1" -Version v#.#.#`

For example:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\install.ps1" -Version v0.9.47`

# Updating

Use these instructions to update bzBond-server to the latest version

## Updating on macOS/Linux

On macOS or Linux use the following command to update bzBond-server:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.sh | bash`

## Updating on Windows Server

On Windows Server use the following command in PowerShell to update bzBond-server:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1"`

## Updating with a proxy on macOS/Linux

On macOS/Linux reference the proxy in the update command as follows:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.sh | bash -s -- -x http://proxy.address.com:port#`

For example:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.sh | bash -s -- -x http://proxy.example.com:443`

## Updating with a proxy on Windows Server

On Windows Server reference the proxy in the update command as follows

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1" -Proxy http://proxy.address.com:port#`

For example:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/update.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\update.ps1" -Proxy http://proxy.example.com:443`

# Usage

For details on using bzBond-server see the bzBond-claris documentation for [running JavaScript functions with the `bzBondRelay` script (client and server)](../bzBond-claris/README.md#running-javascript-functions-with-the-bzbondrelay-script-client-and-server).

# Microbonds

Microbonds are custom endpoints in the bzBond-server microservice that extend its capabilities. Microbonds can perform specific tasks, interact with external APIs, or provide an interface for other applications installed on the server.

## Microbond installation

### Microbond installation on macOS/Linux

On macOS/Linux use the following command to install a Microbond:

`/var/www/bzbond-server/bin/install-microbond.sh`

### Microbond installation on Windows Server

On Windows Server use the following command to install a Microbond:

`powershell -File "C:\Program Files\bzBond-server\bin\install-microbond.ps1"`

### Microbond installation with command line arguments

The installer will prompt for the Microbond name and source url. The Microbond name and source url can also be provided as command line arguments.

#### Example of Microbond installation command including name and source url on macOS/Linux

`/var/www/bzbond-server/bin/install-microbond.sh bzmb-hello-world https://github.com/beezwax/bzbond-server-microbond-example`

#### Example of Microbond installation command including name and source url on Windows Server

`powershell -File "C:\Program Files\bzBond-server\bin\install-microbond.ps1" bzmb-hello-world https://github.com/beezwax/bzbond-server-microbond-example`

Supported URL formats are full GitHub URLs (as shown above), or a path to a local git repository.

### Microbond installation local git repo url format

#### Examples of local git repo url format for Microbond installation on macOS/Linux

`/home/my-username/a-microbond-git-repo`

`../some-folder/a-microbond-git-repo`

#### Examples of local git repo url format for Microbond installation on Windows Server

`C:\Users\my-username\a-microbond-git-repo`

`..\some-folder\a-microbond-git-repo`

### Microbond installation with a proxy on macOS/Linux

On macOS/Linux reference the proxy in the installation command as follows:

`/var/www/bzbond-server/bin/install-microbond.sh -x http://proxy.address.com:port#`

For example:

`/var/www/bzbond-server/bin/install-microbond.sh -x http://proxy.example.com:443`

When installing on macOS/Linux with command line arguments and a proxy either positional _or_ named parameters must be used, they cannot be mixed.

Positional example:

`/var/www/bzbond-server/bin/install-microbond.sh microbond-name url http://proxy.example.com:443`

Named example:

`/var/www/bzbond-server/bin/install-microbond.sh -n microbond-name -u url -x http://proxy.example.com:443`

Mixed example (will __not__ work):

`/var/www/bzbond-server/bin/install-microbond.sh microbond-name url -x http://proxy.example.com:443`

### Microbond installation with a proxy on Windows Server

On Windows Server reference the proxy in the installation command as follows:

`powershell -File "C:\Program Files\bzBond-server\bin\install-microbond.ps1" -Proxy http://proxy.address.com:port#`

For example:

`powershell -File "C:\Program Files\bzBond-server\bin\install-microbond.ps1" -Proxy http://proxy.example.com:443`

## Microbond update

### Microbond update on macOS/Linux

On macOS/Linux use the following command to update a Microbond:

`/var/www/bzbond-server/bin/update-microbond.sh microbond-name`

### Microbond update on Windows Server

On Windows Server use the following command to update a Microbond:

`powershell -File "C:\Program Files\bzBond-server\bin\update-microbond.ps1" microbond-name`

### Microbond update with a proxy on macOS/Linux

On macOS/Linux use the following command to update a Microbond with a proxy:

`/var/www/bzbond-server/bin/update-microbond.sh microbond-name http://proxy.address.com:port#`

For example:

`/var/www/bzbond-server/bin/update-microbond.sh microbond-name http://proxy.example.com:443`

### Microbond update with a proxy on Windows Server

On Windows Server use the following command to update a Microbond with a proxy:

`powershell -File "C:\Program Files\bzBond-server\bin\update-microbond.ps1" microbond-name http://proxy.address.com:port#`

For example:

`powershell -File "C:\Program Files\bzBond-server\bin\update-microbond.ps1" microbond-name http://proxy.example.com:443`

## Microbond creation

Microbonds are npm packages. The quickest way to create one is using the create-microbond script.

### Microbond creation on macOS/Linux

On macOS/Linux use the following command to create a Microbond:

`bash <(curl -s https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-microbond.sh)`

### Microbond creation on Windows

On Windows use the following command to create a Microbond:

`powershell -exec bypass -c "(New-Object Net.WebClient).Proxy.Credentials=[Net.CredentialCache]::DefaultNetworkCredentials;iwr('https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-microbond.ps1')|iex"`

### Microbond creation: Namespacing

It is strongly recommended that Microbond names and routes are namespaced to prevent collisions.

To illustrate, consider Beezwax-created Microbonds. These Microbonds and their routes are namespaced `bzmb`. The namespace is followed by a hyphen (`-`) and then a descriptive name. For example `bzmb-array`.

Routes within a Microbond must also adopt namespacing as duplicate routes are not allowed. For example a route to sort an array with `bzmb-array` would be named `bzmb-array-sort`.

## Microbond publishing

Microbonds can be published by simply pushing the local git repo to github and making it public.

Microbonds that are private or otherwise unsuitable for publishing will need to be privately "published" (i.e. copied) to a location accessible to the server where they are being installed. See the [installing Microbonds](#microbond-installation-local-git-repo-url-format) for examples of local repo references.

## Microbond uninstallation

### Microbond uninstallation on macOS/Linux

On macOS/Linux use the following command to uninstall a Microbond:

`/var/www/bzbond-server/bin/uninstall-microbond.sh microbond-name`

### Microbond uninstallation on Windows Server

On Windows Server use the following command to uninstall a Microbond:

`powershell -File "C:\Program Files\bzBond-server\bin\uninstall-microbond.ps1" microbond-name`

### Microbond uninstallation with a proxy on macOS/Linux

On macOS/Linux reference the proxy in the uninstallation command as follows:

`/var/www/bzbond-server/bin/uninstall-microbond.sh -x http://proxy.address.com:port#`

For example:

`/var/www/bzbond-server/bin/uninstall-microbond.sh -x http://proxy.example.com:443`

When uninstalling on macOS/Linux with command line arguments and a proxy either positional or named parameters must be used, they cannot be mixed.

Positional example:

`/var/www/bzbond-server/bin/uninstall-microbond.sh microbond-name http://proxy.example.com:443`

Named example:

`/var/www/bzbond-server/bin/uninstall-microbond.sh -n microbond-name -x http://proxy.example.com:443`

Mixed example (will __not__ work):

`/var/www/bzbond-server/bin/uninstall-microbond.sh microbond-name -x http://proxy.example.com:443`

### Microbond uninstallation with a proxy on Windows Server

On Windows Server reference the proxy in the uninstallation command as follows:

`powershell -File "C:\Program Files\bzBond-server\bin\uninstall-microbond.ps1" -Name micrbond-name -Proxy http://proxy.address.com:port#`

For example:

`powershell -File "C:\Program Files\bzBond-server\bin\uninstall-microbond.ps1" -Name micrbond-name -Proxy http://proxy.example.com:443`

# Logs

## bzBond-Server logs on macOS/Linux

On macOS/Linux the bzBond-server log folder is: `/var/log/bzbond-server`. There are two log files, `error.log` and `access.log`. The `error.log` file shows errors encountered during the execution of JavaScript code. The `access.log` file shows all calls to bzBond-server. It also logs when the bzBond-server service starts.

### Viewing bzBond-Server logs on macOS

On macOS use the following command to view the most recent entries in the bzBond-server logs:

`tail /var/log/bzbond-server/error.log`

or

`tail /var/log/bzbond-server/access.log`

### Viewing bzBond-Server logs on Linux

On Linux use the following command to view the bzBond-server log:

`journalctl -u bzbond-server.service`

## Viewing bzBond-Server logs on Windows Server

On Windows Server logs for bzBond-server can be viewed in the Computer Management app in the following location:

Error Log:

`C:\Program Files\bzBond-server\daemon\bzbondserver.err.log`

Request log:

`C:\Program Files\bzBond-server\daemon\bzbondserver.out.log`

# Uninstallation

## Uninstallation on macOS/Linux

On macOS/Linux use the following command to uninstall bzBond-server:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.sh | bash`

## Uninstallation on Windows Server

On Windows Server use the following command to uninstall bzBond-server:

`powershell Invoke-WebRequest https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.ps1 -OutFile "$($env:USERPROFILE)\AppData\Local\Temp\uninstall.ps1"|powershell -File "$($env:USERPROFILE)\AppData\Local\Temp\uninstall.ps1"`