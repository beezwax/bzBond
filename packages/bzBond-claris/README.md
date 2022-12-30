# bzBond-claris

## Table of contents

- [Introduction](#introduction)
- [Adding bzBond-claris to an existing solution](#adding-bzbond-claris-to-an-existing-solution)
- [Integrating JavaScript functions with FileMaker scripts](#integrating-javascript-functions-with-filemaker-scripts)

## Introduction

bzBond-claris is a FileMaker file that includes tools for web code integration, storage, deployment and debugging. It comprises
- The `bzBondRelay` script for managing communication between web viewers and FileMaker.
- The bzBond Web Project Manager for storing, deploying and debugging web code in FileMaker web viewers.

## Adding bzBond-claris to a target FileMaker/Claris file

1. Download the [bzBond-claris.fmp12](https://github.com/beezwax/bzbond/blob/main/packages/bzBond-claris/bzBond-claris.fmp12?raw=true) source file.

2. Copy the `WEB_PROJECT` table into the target file

3. Import or copy the following scripts into the target file:  
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

4. Create a layout in the target file to contain the web project manager with the following spec:
  - `Width: 800px`
  - `Height: 610px`
  - Minimalist theme
  - Body part only
  - Show records from: WEB_PROJECT

5. Copy the objects from the `bzBond Web Project Manager` layout into the newly created layout

## Integrating JavaScript functions with FileMaker scripts

bzBond-claris allows FileMaker scripts to run JavaScript functions and return the in the regular script flow.

The recommended way to do this is via the `"PERFORM_JAVASCRIPT"` mode of the bzBondRelayScript.

It also possible to use this functionality by calling `Perform Javascript in Web Viewer` script step on a web viewer that has bzBond isntalled. This allows the following FileMaker scripting pattern:

```
Perform JavaScript in Web Viewer [ ... ]
Set Variable[ $javaScriptResult; Get ( ScriptResult ) ]
```

Results of functions called using `Perform Javascript in Web Viewer` can be captured inline with minimal impact on the normal FileMaker script flow.

To utilize this feature configure the `Perform Javascript in Web Viewer` script step as follows:

- Function Name: `bzBond`
- First parameter either
    - a function in the global (window) JavaScript context of the web viewer OR
    - a JavaScript function (arrow or classic) defined as a string
- Subsequent parameters will be passed into the function. To treat a JavaScript parameter as a callback function, prefix it with the 'ƒ' symbol (⌥ + f on macs).

Results are always obtained via `Get ( ScriptResult )`, nested in the `response.result` key. The `response.result` prop will be appropriately formatted (eg: as a number for numbers, string for strings, object for objects, etc...).

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


## Web code storage

## Web code deployment

## Debugging

## Web viewer config

bzBond can maintain a simple json configuration object for each web viewer in a FileMaker global variable. This object can contain any information useful to the JavaScript integration, such as the layout context, script names, and supporting data such as value lists.

### Web viewer config object structure

In FileMaker all web viewer configuration objects are stored in a global variable named `$$_BZBOND__WEB_VIEWER_CONFIG`. The structure is as follows

```
{
	"<layout_name>": {
		"<web_viewer_name>": {

			// 
			"webProject": "<web_project_name>"

			// Other properties:
			...
		}
	}
}
```

When using bzBond for code deployment, the "webProject" links web viewers to web projects stored in the web project manager.

### Setting web viewer config

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