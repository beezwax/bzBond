# bzBond

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Requirements](#requirements)
- [Usage](#usage)
  - [Performing FileMaker Scripts from JavaScript](#performing-filemaker-scripts-from-javascript)
    - [PerformScript](#bzbondperformscriptscriptname-scriptparameter--options)
    - [{Set/Get}WebViewerName](#bzbondsetwebviewernamewebviewername--bzbondgetwebviewername)
    - [SetWebViewerNameFromFM](#bzbondsetwebviewernamefromfm)
    - [{Set/Get}RelayScriptName](#bzbondsetrelayscriptnamerelayscriptname--bzbondgetrelayscriptname)
    - [SyncConfig](#bzbondsyncconfig)
    - [RegisterScript](#bzbondregisterscriptpluginoptions)
  - [Promise rejection and Error Handling](#promise-rejection-and-error-handling)
  - [Performing JavaScript functions from FileMaker](#performing-javascript-functions-from-filemaker)
- [Contributors](#contributors)

---

## Introduction

bzBond-js is part of the bzBond toolset. It manages interactions between FileMaker scripts and FileMaker Web Viewers.

### Features

- Perform FileMaker scripts, return the script result as **JavaScript Promises**.
- Perform JavaScript from FileMaker, return the JS result back into FileMaker.
- Extensible through a built-in plugin registration system.
- bzBond-js is also used as the function runner for the bzBond-server web service, allowing you to perform JavaScript on server.

## Installation

1. Install bzBond-js
```
npm i @beezwax/bzbond-js
```

<!-- TODO: Update location/name of FM file/script for download -->
2. Download the following FileMaker file, and copy the `bzBondRelay` script into the target FileMaker file.
```
curl -O https://github.com/beezwax/bzbond-relay-script/raw/main/bzbond-relay-script.fmp12
```
<!-- TODO: Update location/name of FM file/script for download -->

## Requirements

- FileMaker >=19.3.
- Web Viewers that host the bzBond code must:
  - Have a **name** (via FileMaker layout inspector).
  - Have the **'Allow JavaScript to perform FileMaker scripts'** option on Web Viewers checked.

---

## Usage

### Performing FileMaker Scripts from JavaScript

#### bzBond.PerformScript(scriptName, scriptParameter [, options])

```
bzBond.PerformScript("add two numbers", { firstNum: 1, secondNum: 2 })
    .then((result) => console.log(result));

bzBond.PerformScript("Get User Data", "user-123", { timeout: 3000 })
    .then((data) => console.log(data.firstName))
    .catch((e) => console.log('request took too long', e));
```

<!-- TODO: name of Relay Script file/script for download -->
The (optional) **options** parameter can contain any of the following (defaults shown):
```
{
    webViewerName: "",         // The name of the web viewer hosting the web code.
    timeout: null,             // Number of milliseconds to wait before a promise is rejected.
    callType: 0                // The FileMaker 'call type'.
    relayScript: "bzBondRelay" // The relay script as it is named in the FileMaker solution.
    ignoreResult: false        // When true, promise resolves immediately - does not wait for FileMaker script.
}
```

The **callType** can be any of the following values (when not provided it is "continue" by default). See the [Claris documentation](https://help.claris.com/en/pro-help/content/options-for-starting-scripts.html) for more details.
```
"continue"  (or 0, "0")
"halt"      (or 1, "1")
"exit"      (or 2, "2")
"resume"    (or 3, "3")
"pause"     (or 4, "4")
"interrupt" (or 5, "5")
```

The **callType** can alternatively be provided as part of an object, or string.
```
    bzBond.PerformScript("Get Data", "", { callType: "interrupt" });
    // is equal to
    bzBond.PerformScript("Get Data", "", "interrupt" );
```

#### bzBond.SetWebViewerName(webViewerName) | bzBond.GetWebViewerName()

This method manually associates bzBond with the name of the Web Viewer the code resides in.
- This step is optional when using the provided bzBondRelay script (it automatically determines the name of the web viewer).
- If you choose to write a custom relay script using the spec, you may need to set the name in your JS code.

```
    bzBond.GetWebViewerName(); // "" (default)
    bzBond.SetWebViewerName("myWebViewer");
    bzBond.GetWebViewerName(); // "myWebViewer"
```

#### bzBond.SetWebViewerNameFromFM()

Determines the name of the web viewer that bzBond is running in and stores it as part of the bzBond instance. This is useful for ensuring that subsequent `bzBond.PerformScript` calls do not invoke potentially expensive searches for the initiating web viewer.

Returns a **promise**

```
bzBond.GetWebViewerName(); // ""
bzBond.SetWebViewerNameFromFM()
    .then((result) => {
        console.log(result) // "myWV"
        console.log(bzBond.GetWebViewerName()) // "myWV"
    });
```


#### bzBond.SetRelayScriptName(relayScriptName) | bzBond.GetRelayScriptName()

If you choose to change the name of the Relay Script in FileMaker, use this step to ensure bzBond calls to FileMaker perform the correct script.

```
bzBond.GetRelayScriptName(); // "bzBondRelay" (default)
bzBond.SetRelayScriptName("My Relay Script");
bzBond.GetRelayScriptName(); // "My Relay Script"
```

<!-- TODO: Need clarity on what to update this section to -->
#### bzBond.SyncConfig()

By defining a JSON blob in the `Web Address` portion of the Web Viewer:
- `SyncConfig` returns the Web Viewer JSON configuration as a **promise** result.
- `SetWebViewerConfigFromFM` calls FileMaker and updates the configuration stored in bzBond.
- `SetWebViewerConfig(webViewerConfig)` allows manual overwrite of the configuration stored in bzBond.
- `GetConfig` returns the current configuration stored in bzBond.

```
// For example:
// • A Web Viewer is in the context of the PERSON table.
// • The PERSON::NAME field is "John Smith".
// • This Web Viewer's Web Address is set to JSONSetElement( "{}" ; "NAME" ; PERSON::NAME ; JSONString )

bzBond.GetConfig() // "{}"
bzBond.SetConfig({"NAME": "Kevin Puddlefoot"});
bzBond.GetConfig() // { "NAME": "Kevin Puddlefoot" }
bzBond.SyncConfig().then((config) => {
    console.log(config.NAME) // "John Smith"
});
```


#### bzBond.RegisterScript(pluginOptions)

It possible to extend bzBond by registering custom FileMaker scripts, which can then be can be called as methods.

1. Create a script in FileMaker.
2. Perform `bzBond.RegisterScript` giving it the appropriate **pluginOptions**:
  - `exec`: the method that becomes available to use on the `bzBond` class.
  - `scriptName`: the FileMaker script that will be run when the method defined in `exec` is called.
  - `throwIf`: (optional) callback function that takes the result of the script defined in `scriptName` as a parameter. If the function returns `true` an error will be thrown.

```
// In this example, we create a FileMaker script called 'Execute Data Api', and associate that with the method 'executeDataApi'
bzBond.RegisterScript({
    exec: "executeDataApi",
    scriptName: "Execute Data Api",
    throwIf: (scriptResult) => {
        return scriptResult.messages[0].code !== "0" ;
    },
});


// Performing the script
const myQuery = {
    layouts: "FAKE_DATA",
    query: [{
        SOME_DATA: "==definitely data here",
    }],
};
bzBond.executeDataApi(myQuery)
    .then((result) => {
        console.log('my data', result);
    })
    .catch((e) => {
        console.log('query failed', e.toString());
    });


// The second parameter can also take advantage of bzBond options
bzBond.executeDataApi(myQuery, { timeout: 3000, callType: "interrupt" })
    .then((result) => {
        console.log('my data', result);
    })
    .catch((e) => {
        console.log('query failed', e.toString());
    });
```
---
### Promise rejection and Error Handling

The promises settled by the bzBond relay script will only reject when the specified FileMaker script is missing.

Otherwise, the result of the script's `Exit Script[]` step will be returned as the result of **resolved promise** and **not** a rejected promise. Because there is no standard way to indicate that a FileMaker script resulted in an error, the result of the promise will need to be inspected and an error thrown if required.

Note that when registering a plugin, the `throwIf` parameter can be used set the result state(s) that should throw errors.

---

### Performing JavaScript functions from FileMaker

A web viewer that contains the bzBond class can return the result of a JavaScript function performed by FileMaker's `Perform Javascript in Web Viewer` script step. This allows the following FileMaker scripting pattern:

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

**Errors** are captured and returned for the following scenarios:

- function does not exist in JavaScript.
- function defined as a string in FileMaker has invalid syntax (eg: `"(a, b,,, => a + b"`).
- function executed in JavaScript throws an error.
- bzBond does not exist in the web viewer (in this case, the PerformJavascript step itself will surface an error - this situation must be manually handled).

```
{
	"messages" :
	[
		{
			"code" : "5",
			"message" : "The function 'MyGlobalFunc' is missing from the global scope, or is not a valid function definition"
		}
	],
	"response" : {}
}
```

---

## Contributors

> Created by the [Beezwax team](https://www.beezwax.net/)
