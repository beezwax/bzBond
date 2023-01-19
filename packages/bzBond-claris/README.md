# bzBond-claris

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [FileMaker Add-on](#filemaker-add-on)
  - [Manual Installation](#manual-installation)
- [Usage: bzBondRelay script](#usage-bzbondrelay-script)
  - [Integrating JavaScript functions with FileMaker scripts](#integrating-javascript-functions-with-filemaker-scripts)

## Introduction

Part of the bzBond toolset, bzBond-claris is a FileMaker file that includes tools for web code integration, storage, deployment and debugging. It comprises
- The `bzBondRelay` script for managing communication between web viewers/JavaScript and FileMaker scripts.
- The bzBond web project manager for storing, deploying, configuring, and debugging web code for use in FileMaker web viewers.

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

## Usage: bzBondRelay script

### Introduction

The `bzBondRelay` script manages FileMaker interactions with web code. These interactions are between FileMaker scripts and FileMaker web viewers, or FileMaker scripts and the [bzBond-server](../bzBond-server/) app.

The majority of these functions are called from the [bzBond-js](../bzBond-js/) and are documented there. The exception is the Perform JavaScript feature, which enables JavaScript functions to be integrated into a regular FileMaker script flow.

### Integrating JavaScript functions with FileMaker scripts

bzBond-claris allows FileMaker scripts to run JavaScript functions and access the results via `Get ( ScriptResult )`. The format of the result is the same as FileMaker Data API:

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

#### Running JavaScript functions by calling bzBondRelay (client and server)

The recommended way to leverage JavaScript functions in FileMaker scripts is using the `"PERFORM_JAVASCRIPT"` mode of the `bzBondRelay` script. It allows you to call the `bzBondRelay` script with specific parameters and get a result back via `Get ( ScriptResult )`, which is a familar pattern. It also works server-side server if you have either the [bBox plug-in v0.99+](https://www.beezwax.net/products/bbox) or [bzBond-server](../bzBond-server/) microserver framework installed on the server.

The script pattern is

```
Perform Script [ bzBondRelay; <parameters> ]
Set Variable[ $javaScriptResult; Get ( ScriptResult ) ]
```

##### Script parameters

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
  - a function in the global (window) JavaScript context of the web viewer OR
  - a JavaScript function (arrow or classic) defined as a string
- Notes:
  - Use the `Insert Text` script step to define functions without having to worry about escaping quotes.

**parameters**
- Type: array of strings
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
  - Not required when route is `"code"`

**route**
- Type: string
- Value: `"function"` or `"code"`.
  - When `"function"` the supplied function is executed with the parameters provided in the `$parameters` variable
  - When `"code"` the result of the last statement in of the code will be returned
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
  "function": "(a, b, c) => a + b",
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

**code route example**
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

## bzBond web project manager

### Introduction

The bzBond web project manager is used for storing, deploying, configuring, and debugging web code for use in FileMaker web viewers.

bzBond-claris is opinionated. It supports integrating web technologies in a specific way. Below are the key design choices and the reasoning behind them.

- Web code is stored as data in a FileMaker table. Code stored in this table is called a "web project". Storing web projects in a table has the following avantages:
  - It keeps them organized and increases their visibility in a solution.
  - It allows them to be updated via scripts or the Data API, meaning they can be part of a build chain or continuous delivery approach.
  - It enables debugging features that support "live development" of web projects. 
- Web projects are stored in a single html file. This allows them to be deployed as data urls.
- Web projects are deployed in web viewers using FileMaker scripts. This allows close control over how and when web viewers are populated and helps avoid timing issues.
- Web viewer "config" is used to determine which web project is deployed in a web viewer. Config can also be used to store useful supporting data such as value lists or script names. Leveraging config allows web projects to contain fewer hard-coded and context specific references, meaning they are more likely to be reusable.
- Config is defined in the web viewer calculation dialog. This allows web viewers to be added to layouts and configured without leaving the Manage Layout UI.

### bzBond web projects

bzBond web projects are self-contained single html files, sometimes called "inline" files because all of the CSS, JavaScript and HTML code is contained "inline" in the file rather than split into separate files.

#### Creating bzBond web projects

While it is possible to manually craft single-file web projects it is usually not best practice. Instead, web projects are authored as multi-file projects

### Web code storage

### Web code deployment

### Debugging

### Web viewer config

bzBond can maintain a simple json configuration object for each web viewer in a FileMaker global variable. This object can contain any information useful to the JavaScript integration, such as the layout context, script names, and supporting data such as value lists.

#### Web viewer config object structure

In FileMaker all web viewer configuration objects are stored in a global variable named `$$_BZBOND__WEB_VIEWER_CONFIG`. The structure is as follows

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

When using bzBond for code deployment, the "webProject" links web viewers to web projects stored in the web project manager.

#### Setting web viewer config

The easiest place to set a web viewer's config is in its calculation dialog. This can be done using the following calculation.

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
          "otherConfigItem";
          "Some item"
          JSONString
        ];
        [
          "aValueList";
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