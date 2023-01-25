# bzBond-web-template

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
  - [Authoring](#authoring)
    - [Getting config from Claris/FileMaker Pro with promise chaining](#getting-config-from-clarisfilemaker-pro-with-promise-chaining)
    - [Getting config from Claris/FileMaker Pro with async/await](#getting-config-from-clarisfilemaker-pro-with-asyncawait)
     - [Using config from Claris/FileMaker Pro with promise chaining](#using-config-from-clarisfilemaker-pro-with-promise-chaining)
     - [Using config from Claris/FileMaker Pro with async/await](#using-config-from-clarisfilemaker-pro-with-asyncawait)
  - [Live development](#live-development)
  - [Building a single-file web project for use in the bzBond web project manager](#building-a-single-file-web-project-for-use-in-the-bzbond-web-project-manager)

## Introduction

The bzBond-web-template is the part of the [bzBond](/) toolset that supports web project authoring. It is an npm project with the following features:
- A build process, accessed via the command `npm run build`, which generates a single-file web project of the type required by the [bzBond web project manager](../bzBond-claris/README.md#usage-bzbond-web-project-manager)
- The (bzBond-js)[https://www.npmjs.com/package/@beezwax/bzbond-js] npm package to allow easy access to bzBond's features
- An example [index.js](src/js/index.js) file to demonstrate how to get started with live development and web project authoring.

## Installation

The bzBond-web-template is installed via [create-bzbond-app](../create-bzbond-app/). It is included in an [all in one install](../create-bzbond-app/README.md#create-an-all-in-one-bzbond-project) and is the only element of a [web only install](../create-bzbond-app/README.md#create-a-web-only-bzbond-project).

## Usage

### Authoring

Web projects created with this template function are regular npm projects and can be authored as such. By default the template:
- Includes bzBond-js as a dependency in `package.json`
- Includes a default entry point file: [index.js](src/js/index.js) which imports bzBond-js and references syles in [app.scss](src/scss/app.scss). Note that scss files can include plain css, or be entirely plain css.

#### bzBond JavaScript Patterns

Methods in bzBond that interact with Claris/FileMaker Pro return promises. This means you will need to use [promise chaining](https://javascript.info/promise-chaining) or [async/await](https://javascript.info/async-await)

#### Getting config from Claris/FileMaker Pro with promise chaining

```
// Display web viewer config from Claris/FileMaker Pro
bzBond.SyncConfig()
  .then((config) => {
      console.log(config) 
  });
```

#### Getting config from Claris/FileMaker Pro with async/await

```
// Display web viewer config from Claris/FileMaker Pro
const launch = async () => {
  const config = await bzBond.SyncConfig();
  console.log(config)
}

launch();
```

or using an anonymous async function:

```
// Display web viewer config from Claris/FileMaker Pro
(async () => {
  const config = await bzBond.SyncConfig();
  console.log(config) 
})();
```

#### Using config from Claris/FileMaker Pro with promise chaining

```
// Run a script from a web viewer config prop
// and display the result
bzBond.SyncConfig()
  .then((config) => {
      bzBond.PerformScript(config.launchScript)
  })
  .then((scriptResult) => {
    console.log(scriptResult)
  });
```

#### Using config from Claris/FileMaker Pro with async/await

```
// Run a script from a web viewer config prop 
// and display the result
const launch = async () => {
  const config = await bzBond.SyncConfig();
  const scriptResult = await bzBond.PerformScript(config.launchScript);
  console.log(scriptResult);
}

launch();
```

or using an anonymous async function:

```
// Run a script from a web viewer config prop 
// and display the result
(async () => {
  const config = await bzBond.SyncConfig();
  const scriptResult = await bzBond.PerformScript(config.launchScript);
  console.log(scriptResult);
})();
```

### Live development

To see live changes in the browser as you development, run the command `npm start`. This will open your web browser at the project page. To prevent the web browser opening run the command `npm run start_silent` instead.

To use live development with projects stored in the bzBond web project manager see the [debugging and live development](../bzBond-claris/README.md#debugging-and-live-development-for-bzbond-web-projects) section of the bzBond-claris documentation.

### Building a single-file web project for use in the bzBond web project manager

To create a web project that can be added to the [bzBond web project manager](../bzBond-claris/README.md#usage-bzbond-web-project-manager):

Run the command `npm run build`. This creates the single-file web project index.html file at the path `dist/index.html`. See the bzBond-claris [documentation](../bzBond-claris/README.md#storing-web-projects-in-the-bzbond-web-project-manager) for instructions on adding the web project to a Claris/FileMaker solution.