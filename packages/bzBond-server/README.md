# Introduction

bzBond-server is a microservice for [Claris/FileMaker Server](https://www.claris.com/filemaker/server/) that enables execution of JavaScript code. It also acts as a host for additional microservices, called Microbonds. 

# Installation

These installations assume a default installation of Claris/FileMaker Server on the specified platform.

## Installation on macOS/Linux

On macOS or Linux use the following command to install bzBond-server:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.sh | bash`

## Installation on Windows Server

**Note: Install [node](https://nodejs.org/en/download) and [git](https://git-scm.com/downloads) before installing bzBond-server.**

On Windows Server use the following command in PowerShell to install bzBond-server:

`powershell -exec bypass -c "(New-Object Net.WebClient).Proxy.Credentials=[Net.CredentialCache]::DefaultNetworkCredentials;iwr('https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/install.ps1')|iex"`

# Usage

For details on using bzBond-server see the bzBond-claris documentation for [running JavaScript functions with the `bzBondRelay` script (client and server)](../bzBond-claris/README.md#running-javascript-functions-with-the-bzbondrelay-script-client-and-server).

# Microbonds

Microbonds are custom endpoints in the bzBond-server microservice that extend its capabilities. Microbonds can perform specific tasks, interact with external APIs, or provide an interface for other applications installed on the server.

## Installing Microbonds

### Installing Microbonds on macOS/Linux

On macOS/Linux use the following command to install a Microbond:

`/var/www/bzbond-server/bin/install-microbond.sh`

### Installing Microbonds on Windows Server

On Windows Server use the following command to install a Microbond:

`"C:\Program Files\bzBond-server\bin\install-microbond.ps1"`

### Microbond installation with command line arguments

The installer will prompt for the Microbond name and source url. The Microbond name and source url can also be provided as command line arguments.

#### Example of Microbond installation command including name and source url on macOS/Linux

`/var/www/bzbond-server/bin/install-microbond.sh hello-world https://github.com/beezwax/bzbond-server-microbond-example`

#### Example of Microbond installation command including name and source url on Windows Server

`"C:\Program Files\bzBond-server\bin\install-microbond.ps1" hello-world https://github.com/beezwax/bzbond-server-microbond-example`

Supported URL formats are full GitHub URLs (as shown above), or a path to a local git repository.

### Microbond installation local git repo url format

#### Examples of local git repo url format for Microbond installation on macOS/Linux

`/home/my-username/a-microbond-git-repo`

`../some-folder/a-microbond-git-repo`

#### Examples of local git repo url format for Microbond installation on Windows Server

`C:\Users\my-username\a-microbond-git-repo`

`..\some-folder\a-microbond-git-repo`

## Updating microbonds

### Updating microbonds on macOS/Linux:

On macOS/Linux use the following command to update a Microbond:

`/var/www/bzbond-server/bin/update-microbond.sh microbond-name`

### Updating microbonds on Windows Server:

On Windows Server use the following command to update a Microbond:

`"C:\Program Files\bzBond-server\update-microbond.ps1" microbond-name`

## Creating Microbonds

Microbonds are npm packages. The quickest way to create one is using the create-microbond script.

### Create a Microbond on macOS/Linux

On macOS/Linux use the following command to create a Microbond:

`bash <(curl -s https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-microbond.sh)`

### Create a Microbond on Windows

On Windows use the following command to create a Microbond:

`powershell -exec bypass -c "(New-Object Net.WebClient).Proxy.Credentials=[Net.CredentialCache]::DefaultNetworkCredentials;iwr('https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/create-microbond.ps1')|iex"`

### Creating Microbonds: Namespacing

It is strongly recommended that Microbond names and routes are namespaced to prevent collisions.

To illustrate, consider Beezwax-created Microbonds. These Microbonds and their routes are namespaced `bzmb`. The namespace is followed by a hyphen (`-`) and then a descriptive name. For example `bzmb-array`.

Routes within a Microbond must also adopt namespacing as duplicate routes are not allowed. For example a route to sort an array with `bzmb-array` would be named `bzmb-array-sort`.

## Publishing Microbonds

Microbonds can be published by simply pushing the local git repo to github and making it public.

Microbonds that are private or otherwise unsuitable for publishing will need to be privately "published" (i.e. copied) to a location accessible to the server where they are being installed. See the [installing Microbonds](#microbond-installation-local-git-repo-url-format) for examples of local repo references.

## Unistalling Microbonds

### Uninstalling Microbonds on macOS/Linux

On macOS/Linux use the following command to uninstall a Microbond:

`/var/www/bzbond-server/bin/uninstall-microbond.sh microbond-name`

### Uninstalling Microbonds on Windows Server

On Windows Server use the following command to uninstall a Microbond:

`"C:\Program Files\bzBond-server\bin\uninstall-microbond.ps1" microbond-name`

# Logs

## bzBond-Server logs for macOS/Linux

On macOS/Linux the bzBond-server log folder is: `/var/log/bzbond-server`. There are two log files, `error.log` and `access.log`. The `error.log` file shows errors encountered during the execution of JavaScript code. The `access.log` file shows all calls to bzBond-server. It also logs when the bzBond-server service starts.

### Viewing bzBond-Server logs macOS

On macOS use the following command to view the most recent entries in the bzBond-server logs:

`tail /var/log/bzbond-server/error.log`

or

`tail /var/log/bzbond-server/access.log`

### Viewing bzBond-Server logs Linux

On Linux use the following command to view the bzBond-server log:

`journalctl -u bzbond-server.service`

## bzBond-Server logs for Windows Server

On Windows Server logs for bzBond-server can be viewed in the Computer Management app in the following location:

`Computer Management (Local) > System Tools > Event Viewer > Windows Logs > Application`

# Uninstall

## Uninstalling on macOS/Linux

On macOS/Linux use the following command to uninstall bzBond-server:

`curl -o- https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.sh | bash`

## Uninstalling on Windows Server

On Windows Server use the following command to uninstall bzBond-server:

`powershell -exec bypass -c "(New-Object Net.WebClient).Proxy.Credentials=[Net.CredentialCache]::DefaultNetworkCredentials;iwr('https://raw.githubusercontent.com/beezwax/bzBond/main/packages/bzBond-server/bin/uninstall.ps1')|iex"`