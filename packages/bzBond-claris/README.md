# bzBond-claris

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
  - [FileMaker Add-on](#filemaker-add-on)
  - [Manual Installation](#manual-installation)
- [bzBondRelay script](#bzbondrelay-script)
  - [Integrating JavaScript functions with FileMaker scripts](#integrating-javascript-functions-with-filemaker-scripts)

## Introduction

Part of the bzBond toolset, bzBond-claris is a FileMaker file that includes tools for web code integration, storage, deployment and debugging. It comprises
- The `bzBondRelay` script for managing communication between web viewers/JavaScript and FileMaker scripts.
- The bzBond Web Project Manager for storing, deploying, configuring, and debugging web code in FileMaker web viewers.

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

5. Import or copy the following scripts into the target file:  
  `bzBondRelay`  
  `bzBond Clear Web Project Cache`  
  `bzBond Clear Web Project Cache OnClick`  
  `bzBond Launch From Create bzBond App`  
  `bzBond Load Web Viewer`  
  `bzBond Load Web Viewers On Current Layout`  
  `bzBond Open Default Web Viewer In Debug Mode`  
  `bzBond Set Source Code From URL`  
  `bzBond Set Source Code From URL OnClick`  
  `bzBond Toggle Web Project Debug Mode`  
  `bzBond Toggle Web Project Debug Mode OnClick`  
  `bzBond Toggle Web Viewer Debug Mode`  
  `bzBond Toggle Web Viewer Debug Mode OnClick`  
  `bzBond Turn Off Debug Mode For All Web Projects`  
  `bzBond Turn Off Debug Mode For All Web Projects OnClick`  
  `bzBond Turn Off Debug Mode For All Web Viewers`  
  `bzBond Turn Off Debug Mode For All Web Viewers OnClick`  
  `bzBond Upsert Web Project`  

6. Copy the objects from the `bzBond Web Project Manager` layout into the `bzBond Web Project Manager` created in step 3

7. Copy the objects from the `bzBond Default Web Viewer` layout into the `bzBond Default Web Viewer` created in step 4

## bzBondRelay script

### Introduction

The `bzBondRelay` script manages FileMaker interactions with web code. These interactions are between FileMaker scripts and FileMaker web viewers, or FileMaker scripts and the [bzBond-server](../bzBond-server/) app.

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

The recommended way to leverage JavaScript functions is using the `"PERFORM_JAVASCRIPT"` mode of the `bzBondRelay` script. It allows you to call the `bzBondRelay` script with specific parameters and get a result back via `Get ( ScriptResult )`, which is a familar pattern. It also works on both client and server, if you have either the [bBox plug-in v0.99+](https://www.beezwax.net/products/bbox) or [bzBond-server](../bzBond-server/) installed on the server.

The pattern is

```
Perform Script [bzBondRelay]
Set Variable[ $javaScriptResult; Get ( ScriptResult ) ]
```

#### Running JavaScript functions using Perform JavaScript in web viewer (client only)

It also possible to use this functionality by directly calling `Perform Javascript in Web Viewer` script step on a web viewer that has bzBond intalled. This only works on the client as web viewers are not supported on the server.

This can be done with following FileMaker scripting pattern:

```
Perform JavaScript in Web Viewer [ ... ]
Set Variable[ $javaScriptResult; Get ( ScriptResult ) ]
```

Configure the `Perform Javascript in Web Viewer` script step as follows:

- Function Name: `bzBond`
- First parameter either
    - a function in the global (window) JavaScript context of the web viewer OR
    - a JavaScript function (arrow or classic) defined as a string
- Subsequent parameters will be passed into the function. To treat a JavaScript parameter as a callback function, prefix it with the 'ƒ' symbol (⌥ + f on macs).

**Example 1** Calling a function AddTwoNumbers that is accessible via `window.AddTwoNumbers` in the web viewer.

```
Perform JavaScript in Web Viewer [
    Object Name: "MyWebViewer" ;
    Function Name: "bzBond" ;
    Parameters: "AddTwoNumbers", 3, 5 
]

Set Variable [
    $_new_number ;
    Value: JSONGetElement ( Get ( ScriptResult ) ; "response.result" )
]
// $_new_number = 8
```

**Example 2** Calling a JS function defined in FileMaker as a string (allowing you to define and run JavaScript on the fly in FileMaker).

```
Set Variable [
    $_add_two_numbers_func ;
    Value: "(a, b) => a + b"
]

Perform JavaScript in Web Viewer [
    Object Name: "MyWebViewer" ;
    Function Name: "bzBond" ;
    Parameters: $_add_two_numbers_func, 3, 5
]

Set Variable [
    $_new_number ;
    Value: JSONGetElement ( Get ( ScriptResult ) ; "response.result" )
]
// $_new_number = 8
```

**Example 3** Support for Callbacks (remember to prefix with an 'ƒ')

```
Set Variable [
    $_add_number_with_callback ;
    Value: "function (myCallbackForC, a, b, c) { return a + b + myCallbackForC(c); }"
]

Set Variable [
    $_times_two ;
    Value: "ƒ(value) => value * 2"
]

Perform JavaScript in Web Viewer [
    Object Name: "MyWebViewer" ;
    Function Name: "bzBond" ;
    Parameters: $_add_two_numbers_func, $_times_two, 3, 5, 50
]

Set Variable [
    $_new_number ;
    Value: JSONGetElement ( Get ( ScriptResult ) ; "response.result" )
]
// $_new_number = 108

// The full "Get ( ScriptResult )" response:
{
  "messages" :
  [
    {
      "code" : "0",
      "message" : "OK"
    }
  ],
  "response" :
  {
    "result" : 108
  }
}
```


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