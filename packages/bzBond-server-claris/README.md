# bzBond-server-claris

## Table of contents

- [Introduction](#introduction)
- [Pre-requisties](#pre-requisites)
- [Installation](#installation)
  - [FileMaker Add-on](#filemaker-add-on)
  - [Manual Installation](#manual-installation)
  - [Installation for standalone testing](#installation-for-standalone-testing)
- [Usage: bzBondServer script](#usage-bzbond-server-script)

## Introduction

bzBond-server-claris is the part of the [bzBond](/) toolset that handles integration with [bzBond-server](../bzBond-server/).

## Pre-requisites

- A FileMaker file hosted on a server that has [bzBond-server](../bzBond-server/) installed.

## Installation

### FileMaker Add-on

1. [Download](https://github.com/beezwax/bzBond/archive/refs/heads/main.zip) or clone the [bzBond](/) repo
2. Unzip the repo if it was downloaded rather than cloned
3. Copy the contents of the [bzBondServer-addOn](bzBondServer-addOn) folder to the FileMaker Add-on folder:
- macOS: `~/Library/Application Support/FileMaker/Extensions/AddonModules`
- Windows: `Users\<YOUR_USERNAME>\AppData\Local\FileMaker\Extensions\AddonModules`
4. In your target Claris/FileMaker file go into layout mode on any layout
5. In the left panel click the `Add-ons` tab
6. Click the + icon and select bzBond-server-claris. It will be under the `Web` heading.

### Manual installation

1. Download the [bzBond-server-claris.fmp12](bzBond-server-claris.fmp12?raw=true) source file.
2. Import or copy the `bzBondServer` script into the target file

## Installation for standalone testing

1. Download the [bzBond-server-claris.fmp12](bzBond-server-claris.fmp12?raw=true) source file.
2. Upload the file to a FileMaker server [that has bzBond-server installed](#pre-requisites)
3. Test scripts are prefixed `bzBondServer Test`. Run as required.

## Usage: bzBondServer script

The `bzBondServer` script manages FileMaker interactions with [bzBond-server](../bzBond-server/).