# bzBond-web-template

## Table of contents

- [Introduction](#introduction)

## Introduction

The bzBond-web-template is the part of the [bzBond](/) toolset that supports web project authoring. It is an npm project with the following features:
- A build process, accessed via the command `npm run build`, which generates a single-file web project of the type required by the [bzBond web project manager](../bzBond-claris/README.md#usage-bzbond-web-project-manager)
- The (bzBond-js)[https://www.npmjs.com/package/@beezwax/bzbond-js] npm package to allow easy access to bzBond's features
- An example [index.js](src/js/index.js) file to demonstrate how to get started with live development and web project authoring.

## Installation

The bzBond-web-template is installed via [create-bzbond-app](../create-bzbond-app/). It is included in an [all in one install](../create-bzbond-app/README.md#create-an-all-in-one-bzbond-project) and is the only element of a [web only install](../create-bzbond-app/README.md#create-a-web-only-bzbond-project).

## Usage

### Authoring

Web projects created with this template function in the same way as any other npm project: you can freely install packages with `npm install`

### Live development

To see live changes in the browser as you development, run the command `npm start`. This will open your web browser at the project page. To prevent the web browser opening run the command `npm run start_silent` instead.

To use live development with projects stored in the bzBond web project manager see the [debugging and live development](../bzBond-claris/README.md#debugging-and-live-development-for-bzbond-web-projects) section of the bzBond-claris documentation.

### Building a single-file web project for use in the bzBond web project manager

To create a web project that can be added to the [bzBond web project manager](../bzBond-claris/README.md#usage-bzbond-web-project-manager):

Run the command `npm run build`. This creates the single-file web project index.html file at the path `dist/index.html`. See the bzBond-claris [documentation](../bzBond-claris/README.md#storing-web-projects-in-the-bzbond-web-project-manager) for instructions on adding the web project to a FileMaker solution.




