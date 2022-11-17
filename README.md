<p align="center"><img src="bzbond_logo.png" width="75"/></p>

<h2 align="center">Quality tools for Claris Web Integrations</h1>

😎 Reliably run web UIs and JavaScript libraries in web viewers

🏃🏼 Speed up FileMaker scripts with JavaScript functions

💾 Store and deploy web code

🎉 Keep the JavaScript party going server-side with an extensible microservice

## Table of contents

- Getting started
- The tools
  - bzBond-js
  - bzBond-claris

## Getting started

### Claris focused quick start

You'll need [FileMaker or Claris Pro](https://www.claris.com/) installed

1. Download [bzBond-claris.fmp12](packages/bzBond-claris/bzBond-claris.fmp12)
2. Open bzBond-claris.fmp12 and explore

### Web focused quick start

Along with [FileMaker Pro or Claris Pro](https://www.claris.com/), you'll need to install [node/npm](https://nodejs.org/en/download/) and [git](https://git-scm.com/downloads).

1. In the command line run `npx -y @beezwax/create-bzbond-app <project-name>`.<br>
E.g. `npx -y @beezwax/create-bzbond-app testing-bzbond`<br>
A FileMaker file with the same name as your project should open

## bzBond Tools

### bzBond-js

bzBond-js is a javascript library that manages interactions between FileMaker/Claris Pro scripts and web viewer layout objects. It can be installed using the command `npm install @beezwax/bzbond-js`. bzBond-js calls the script bzBondRelay, which is in the [bzBond-claris.fmp12](#bzbond-claris) file.

[Learn more about bzBond-js](packages/bzBond-js/README.md)

### bzBond-claris

bzBond-claris is a FileMaker Pro file that includes the following tools
- The bzBondRelay script
- The bzBond web project manager schema scripts and layouts
- Educational material and examples

[Learn more about bzBond-claris](packages/bzBond-claris/README.md)

### bzBond-server

bzBond-server is a microservice that works with the bzBondRelay script to allow JavaScript to be run on FileMaker/Claris Server.

[Learn more about bzBond-server](packages/bzBond-server/README.md)

### bzBond-web-template

bzBond-web-template is a template for creating bzBond web projects. It includes bzBond-js and a build config that creates a single html file that can be used as the source for a bzBond web project.

### create-bzbond-app

create-bzbond-app is a bootstrapper for creating bzBond web projects.