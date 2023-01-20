# bzBond-claris

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [FileMaker Add-on](#filemaker-add-on)
  - [Manual Installation](#manual-installation)
- [Usage: bzBond web project manager](#usage-bzbond-web-project-manager)
  - [bzBond web projects](#bzbond-web-projects)
    - [Creating bzBond web projects](#creating-bzbond-web-projects)
  - [Storing web projects in the bzBond web project manager](#storing-web-projects-in-the-bzbond-web-project-manager)
  - [Deploying bzBond web projects in web viewers](#deploying-bzbond-web-projects-in-web-viewers)
    - [Full parameters for `bzBond Load Web Viewer`](#full-parameters-for-bzbond-load-web-viewer)
    - [Loading all web viewers on a layout](#loading-all-web-viewers-on-a-layout)
    - [Loading web viewers with script triggers](#loading-web-viewers-with-script-triggers)
  - [Debugging and live development for bzBond web projects](#debugging-and-live-development-for-bzbond-web-projects)
    - [Enabling debug mode for all web viewers using a web project](#enabling-debug-mode-for-all-web-viewers-using-a-web-project)
    - [Enabling debug mode for a single web viewer](#enabling-debug-mode-for-a-single-web-viewer)
  - [Web viewer config](#web-viewer-config)
- [Usage: bzBondRelay script](#usage-bzbondrelay-script)
  - [Integrating JavaScript functions with FileMaker scripts](#integrating-javascript-functions-with-filemaker-scripts)
    - [Running JavaScript functions with the `bzBondRelay` script (client and server)](#running-javascript-functions-with-the-bzbondrelay-script-client-and-server)
      - [bzBondRelay script parameters and examples for performing JavaScript](#bzbondrelay-script-parameters-and-examples-for-performing-javascript)

## Introduction

bzBond-claris is the part of the bzBond toolset that handles web code integration, storage, deployment and debugging. It contains
- The `bzBondRelay` script for managing communication between web viewers/JavaScript and FileMaker scripts.
- The bzBond Web Project Manager for storing, deploying, configuring, and debugging web code for use in FileMaker web viewers.

## Installation

### FileMaker Add-on

1. [Download](https://github.com/beezwax/bzBond/archive/refs/heads/main.zip) or clone the [bzBond](https://github.com/beezwax/bzbond) repo
2. Unzip the repo if it was downloaded rather than cloned
3. Copy the contents of the [bzBond-addOn](bzBond-addOn) folder to the FileMaker Add-on folder:
- macOS: `~/Library/Application Support/FileMaker/Extensions/AddonModules`
- Windows: `Users\<YOUR_USERNAME>\AppData\Local\FileMaker\Extensions\AddonModules`
4. In your target FileMaker file go into layout mode on any layout
5. In the left panel click the `Add-ons` tab
6. Click the + icon and select bzBond-claris. It will be under the `Web` heading.

### Manual installation

1. Download the [bzBond-claris.fmp12](https://github.com/beezwax/bzbond/blob/main/packages/bzBond-claris/bzBond-claris.fmp12?raw=true) source file.

2. Copy the `WEB_PROJECT` table into the target file

3. Create a layout in the target file to contain the web project manager with the following spec:
  - LayoutName: `bzBond Web Project Manager`
  - `Width: 800px`
  - `Height: 610px`
  - Minimalist theme
  - Body part only
  - Show records from: WEB_PROJECT

4. Create a layout in the target file to contain the default bzBond web viewer with the following spec:
  - LayoutName: `bzBond Default Web Viewer`
  - `Width: 320px`
  - `Height: 460px`
  - Minimalist theme
  - Body part only
  - Show records from: WEB_PROJECT

5. Import or copy the `bzBond` script folder into the target file

6. Copy the objects from the `bzBond Web Project Manager` layout into the `bzBond Web Project Manager` layout created in step 3

7. Copy the objects from the `bzBond Default Web Viewer` layout into the `bzBond Default Web Viewer` layout created in step 4

## Usage: bzBond web project manager

The bzBond web project manager is used for storing, deploying, configuring, and debugging web code for use in FileMaker web viewers.

The bzBond web project manager is opinionated in that it supports integrating web technologies in a specific way. Below are the key design choices and the reasoning behind them.

- Web code is stored as data in a FileMaker table. Code stored in this table is called a "web project". Storing web projects in a table has the following advantages:
  - It keeps them organized and increases their visibility in a solution.
  - It allows them to be updated via scripts or the Data API, meaning they can be part of a build chain or continuous delivery approach.
  - It enables the debugging features that support "live development" for web projects. 
- Web projects are stored in a single html file. This allows them to be deployed in web viewers as data urls.
- Web projects are deployed in web viewers using FileMaker scripts. This allows close control over how and when web viewers are populated and helps avoid timing issues.
- Web viewer "config" is used to determine which web project is deployed in a web viewer. Config can also be used to store useful supporting data such as value lists or script names. Leveraging config allows web projects to contain fewer hard-coded and context specific references, meaning they are more likely to be reusable within and between solutions.
- Config is defined in the web viewer calculation dialog. This allows web viewers to be added to layouts and configured without leaving the Manage Layout UI.

### bzBond web projects

bzBond web projects are self-contained single html files, sometimes called "inline" files because all of the CSS, JavaScript and HTML code is contained "inline" in the file rather than split into separate files.

#### Creating bzBond web projects

While it is possible to manually craft single-file web projects it is usually not the best approach when external code libraries are required. Instead, web projects are authored as multi-file projects and then "complied" into single files as part of an automated build process.

The bzBond toolset includes a bootstrapping command for quickly creating new bzBond web projects that include a build process. Providing git and node/npm are installed it can be directly invoked from Terminal or PowerShell with the following command:

`npx -y @beezwax/create-bzbond-app <your_web_project_name_here> --web-only`

e.g.

`npx -y @beezwax/create-bzbond-app my-web-project --web-only`

For more details see the create-bzbond-app [documentation](../create-bzbond-app/README.md).

### Storing web projects in the bzBond web project manager

The simplest way to store a web project in the web project manager is copy-and-paste:

1. Run the build process for your web project
2. Copy the resulting html file contents to the clipboard
3. In FileMaker go to the solution's `bzBond Web Project Manager` layout
4. Press the "Add Web Project" button in the bottom right of the screen (or use the FileMaker New Record command)
5. Enter the name of the web project in `Web Project Name` field
6. Paste the html file contents into the `Source Code` field

Another method is to populate source code via a local or remote url:

1. Enter a url that uses the `http`, `https`, or `file` protocol in the `URL`  field
2. To update the web project source code from the url, click the download button on the right of the field.

### Deploying bzBond web projects in web viewers

To link a web viewer to a web project:

1. Enter the following calculation in the web viewer calculation dialog.

```
Let (
  $$_BZBOND__WEB_VIEWER_CONFIG =
    JSONSetElement (
      $$_BZBOND__WEB_VIEWER_CONFIG;
      Get ( LayoutName )
        & "."
        & "<web_viewer_name>";
      JSONSetElement (
        "{}";
        [
          "webProject";
          "<web_project_name>"
          JSONString
        ]
      );
      JSONObject
    );
  ""
)
```

- Replace the "<web_viewer_name>" placeholder with the name of the web viewer
- Replace the "<web_project_name>" placeholder with the name of the web project to deploy in the web viewer. Make sure it matches the name in the web project manager.

2. To deploy the web project in the web viewer call the the script `bzBond Load Web Viewer` with the webViewer parameter set to the web viewer name: `{ "webViewer": "<web_viewer_name>"}`

#### Full parameters for `bzBond Load Web Viewer`

**webViewer**
- Type: string
- Value: the name of the web viewer to load
- Notes:
  - Required

**waitForLoad**
- Type: boolean
- Value: if `true` the script stack does not continue until the `bzBond` object is availale in the web viewer
- Notes:
  - Default: `false`
  - Setting this parameter to true solves timing issues that can occur due to web viewers running on a separate thread to the FileMaker script engine. In particular, if a script stack starts on a different layout to the one containing the web viewer then setting the `waitForLoad` parameter to `true` is recommended.

**waitForConfig**
- Type: boolean
- Value: if true the script stack does not continue until the `$config` variable has been set.
- Notes:
  - Default: `false`
  - Setting this parameter to true solves timing issues that can occur due to web viewers running on a separate thread to the FileMaker script engine. In particular, if a script stack starts on a different layout to the one containing the web viewer then setting the `waitForConfig` parameter to `true` is recommended.

**clearCache**
- Type: boolean
- Value: if `true` the cached code of the web project is reset to value in the web project manager.
- Notes:
  - Default: false
  - This is to handle cases where a web project or web viewer has been loaded and then the web project code has subsequently been modified.

**noCache**
- Type: boolean
- Value: if `true` the cached code of the web project is ignored and the web project code is retrieved from the web project manager.
- Notes:
  - Default: `false`
  - This is mostly used in development where the web project is being frequently updated in the web project manager and the latest latest version is always required.

**goToWebViewer**
- Type: boolean
- Value: if `true` the web viewer will be made the active object after it is loaded. This is useful for layout where focus should be immediately on the web viewer, for example in a data entry form.
- Notes:
  - Default: `true`
  - This is mostly used in development where the web project is being frequently updated in the web project manager and the latest latest version is always required.

#### Loading all web viewers on a layout

To load all web viewers on a layout rather than specifying them by name:

1. Go to the layout containing the web viewers
2. Run the script `bzBond Load Web Viewers On Current Layout`

Note that you can specify the same parameters as for [`bzBond Load Web Viewer`](#full-parameters-for-bzbond-load-web-viewer) with the exception of `webViewer`. The specified parameters will be applied to all web viewers on the layout.

#### Loading web viewers with script triggers

It is possible to use script triggers to load web viewers as soon as layouts are loaded. The recommended script triggers are
- `OnLayoutEnter` (Enable for Browse mode only)
- `OnModeEnter` (Enable for Browse mode only)

### Debugging and live development for bzBond web projects

"Live development" –where code changes can be observed in real time in an application's UI– is in FileMaker's DNA, and it's also a popular approach in web development. bzBond web projects support live development through debug mode, which can be applied at the web project or web viewer level.

#### Enabling debug mode for all web viewers using a web project

1. Go to the bzBond Web Project Manager layout and navigate to the target web project
2. Click the "Manage Debugging" button in the top right corner
3. Click the "Turn on Debugging For This Project" button and enter the url of your dev server, for example `http://localhost:8080`, then press OK.

#### Enabling debug mode for a single web viewer
1. Go to the bzBond Web Project Manager layout
2. Click the "Manage Debugging" button in the top right corner
3. Click the "Debug Web Viewer..." button
4. Enter the name of the web viewer and the url of your dev server, for example `http://localhost:8080`, then press OK

### Web viewer config

All web viewer configuration objects are stored in a global variable named `$$_BZBOND__WEB_VIEWER_CONFIG`. The structure is as follows

```
{
  "<layout_name>": {
    "<web_viewer_name>": {

      // web project name in WEB_PROJECT table
      "webProject": "<web_project_name>"

      // Other properties:
      ...
    }
  }
}
```

As well as defining the web project to deploy in a web viewer, config can also contain additional information useful to the web project, such as the layout context, script names, and supporting data such as value lists. The config object can be easily accessed from the web project. See the [bzBond-js documentation](../bzBond-js/README.md#bzbondsyncconfig) for details. 

Below is an example of a web viewer calculation with additional config:

```
Let (
  $$_BZBOND__WEB_VIEWER_CONFIG =
    JSONSetElement (
      $$_BZBOND__WEB_VIEWER_CONFIG;
      Get ( LayoutName )
        & "."
        & "<web_viewer_name>";
      JSONSetElement (
        "{}";
        [
          "webProject";
          "<web_project_name>"
          JSONString
        ];
        [
          "tableContext";
          Get ( LayoutTableName )
          JSONString
        ];
        [
          "valueList";
          List (
            "value1";
            "value2";
            "value3"
          )
          JSONString
        ]
      );
      JSONObject
    );
  ""
)
```

## Usage: bzBondRelay script

The `bzBondRelay` script manages FileMaker interactions with web code. These interactions are between FileMaker scripts and FileMaker web viewers, or FileMaker scripts and the [bzBond-server](../bzBond-server/) app.

The majority of these functions are called from [bzBond-js](../bzBond-js/) and are documented there. The exception is the Perform JavaScript feature, which enables JavaScript functions to be integrated into a regular FileMaker script flow.

### Running JavaScript functions with the `bzBondRelay` script (client and server)

The recommended way to leverage JavaScript functions in FileMaker scripts is using the `"PERFORM_JAVASCRIPT"` mode of the `bzBondRelay` script. It allows you to call the `bzBondRelay` script with specific parameters and get a result back via `Get ( ScriptResult )`, which is a familar pattern. It also works server-side server if you have either the [bBox plug-in v0.99+](https://www.beezwax.net/products/bbox) or [bzBond-server](../bzBond-server/) microservice framework installed on the server.

The script pattern is

```
Perform Script [ bzBondRelay; <parameters> ]
Set Variable[ $javaScriptResult; Get ( ScriptResult ) ]
```

The format of the result is the same as FileMaker Data API:

```
{
  "response": {
    "result": <result in correct JSON format>,
    "messages": [{
      code: "<0 or error code>",
      message: "<Ok or error message>"
    }]
  }
}
```

The `response.result` prop will be appropriately formatted (eg: as a number for numbers, string for strings, object for objects, etc...).

##### bzBondRelay script parameters and examples for performing JavaScript

**mode**
- Type: string
- Value: Always `"PERFORM_JAVASCRIPT"`

**webViewerName**
- Type: string
- Value: The name of the web viewer that will run the JavaScript. The web viewer needs to have bzBond-js installed
- Notes:
  - Not required when running on server
  - If blank on client, an attempt will be made to run the script on the currently selected object.

**function**
- Type: string
- Value: either
  - when running on the client or on server where the `route` parameter is `"function"` 
    - a function in the global (window) JavaScript context of the web viewer OR
    - a JavaScript function (arrow or classic) defined as a string OR
  - when running on server where the `route` parameter is `"code"`
    - JavaScript code to execute 
- Notes:
  - Use the `Insert Text` script step to define functions or code without having to worry about escaping quotes.

**parameters**
- Type: array
- Value: An array or parameters to pass to the function.
  - Passing functions as parameters is supported. Prefix a parameter with the 'ƒ' symbol (⌥ + f on macs) to indicate that it is a function. For example: 
  ```
  [
    40,
    2,
    ƒ(c) => c * 2
  ]
  ```
- Notes:
  - Optional (some JS functions do not need parameters)
  - Not required when `route` is `"code"`

**route**
- Type: string
- Value: `"function"` or `"code"`.
  - When `"function"` the function defined in the `function` parameter is executed with the parameters provided in the `parameters` parameter
  - When `"code"` the result of the last statement in the `function` parameter will be returned
- Notes:
  - Not required on client (only functions are supported)
  - Defaults to `"function"` on server

**useBbox**
- Type: boolean
- Value: if [bBox plug-in v0.99+](https://www.beezwax.net/products/bbox) is installed on the FileMaker server and this parameter is true then the JavaScript code will run using bBox.
- Notes:
  - Not applicable on client
  - Optional on server.
  - Defaults to `false`

**Simple example**

```
{
  "mode": "PERFORM_JAVASCRIPT",
  "webViewerName": "JS_Runner",
  "function": "(a, b) => a + b",
  "parameters": [40, 2]
}

// Result
{
  "response": {
    "result": 42,
    "messages": [{
      code: "0",
      message: "Ok"
    }]
  }
}
```

**Function parameter example**

```
{
  "mode": "PERFORM_JAVASCRIPT",
  "webViewerName": "JS_Runner",
  "function": "(a, b, c) => c(a + b)",
  "parameters": [40, 2, ƒ(n) => a * 2]
}

// Result
{
  "response": {
    "result": 84,
    "messages": [{
      code: "0",
      message: "Ok"
    }]
  }
}
```

**`code` route example**
```
{
  "mode": "PERFORM_JAVASCRIPT",
  "webViewerName": "JS_Runner",
  "function": "(40 + 2) * 2",
  "route": "code"
}

// Result
{
  "response": {
    "result": 84,
    "messages": [{
      code: "0",
      message: "Ok"
    }]
  }
}
```