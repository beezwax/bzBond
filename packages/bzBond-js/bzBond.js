function bzBond() {
  const { NO_NEW_KEYWORD, INVALID_PARAMETER } = BZBOND_ERROR_CODE;

  // Prevent use of new keyword
  if (this instanceof bzBond) {
    throw formattedClarisError(
      NO_NEW_KEYWORD,
      "Use of the new keyword is prohibited with bzBond"
    );
  }

  // Figure out if call is intended for promise resolution, or JS function call
  const args = Array.from(arguments);
  if (!args.length) return;

  let [param1, ...rest] = args;
  if (typeof param1 !== "string" || !param1.length) return;

  param1 = tryParse(param1);
  if (typeof param1 !== "object" || !param1.response?.promiseUUID) {
    return handleJSCallFromClaris(param1, rest);
  }

  if (promiseMap.has(param1.response.promiseUUID)) {
    return handleCallFromRelayScript(param1);
  }

  throw formattedClarisError(
    INVALID_PARAMETER,
    "bzBond was called with an invalid a promiseUUID"
  );
}

/* --------------------------- Class Methods (Public) ------------------------------------ */

bzBond.PerformJavaScript = function (func, arr) {
  const args = tryParse(arr);
  bzBond(func, ...args);
};

bzBond.PerformScript = function (
  scriptName,
  scriptParameter = "",
  options = {}
) {
  const { INVALID_PARAMETER, TIMEOUT_HIT } = BZBOND_ERROR_CODE;
  const { PERFORM_SCRIPT: mode } = MODE;

  // (1) Validate parameters
  if (typeof scriptName !== "string" || !scriptName) {
    throw formattedClarisError(
      INVALID_PARAMETER,
      "The script name parameter must be a valid string"
    );
  } else if (typeof options === "number") {
    options = { callType: options.toString() };
  } else if (typeof options === "string") {
    options = { callType: options };
  } else if (typeof options !== "object") {
    throw formattedClarisError(
      INVALID_PARAMETER,
      "Invalid options parameter - must be a filemaker call type (0 - 5), or a valid options object"
    );
  } else if (options !== null) {
    // options is a valid object
    if (options.webViewerName) {
      bzBond.SetWebViewerName(options.webViewerName);
    }
    if (options.relayScriptName) {
      bzBond.SetRelayScriptName(options.relayScriptName);
    }
  } else {
    options = {};
  }

  // (2) Validate Call Type
  const callTypeCheck = String(
    options.callType || DEFAULT_CALL_OPTIONS.callType
  ).toLowerCase();
  if (!callTypeMap.has(callTypeCheck)) {
    throw formattedClarisError(
      INVALID_PARAMETER,
      callTypeCheck.toString() +
        " is not a valid call type. Please use options 0 - 5"
    );
  }
  const callType = callTypeMap.get(callTypeCheck);

  // (3) Validate Relay Script
  const relayScriptName = bzBond.GetRelayScriptName();
  if (typeof relayScriptName !== "string" || !relayScriptName) {
    throw formattedClarisError(
      INVALID_PARAMETER,
      "'" + relayScriptName + "' is not a valid relay script name."
    );
  }

  // Build parameters for FileMaker
  const promiseUUID = createUUID();
  const webViewerName = bzBond.GetWebViewerName();
  const { ignoreResult, timeout } = { ...DEFAULT_CALL_OPTIONS, ...options };
  options = {
    webViewerName,
    ignoreResult,
    ...options,
  };
  const filemakerParameter = {
    promiseUUID,
    mode,
    options,
    script: {
      name: scriptName,
      parameter: scriptParameter,
    },
  };

  // Add deferred Promise to map (used later to resolve/reject)
  const deferred = new deferredPromise();
  const { promise } = deferred;
  promiseMap.set(promiseUUID, deferred);

  // Perform Relay Script
  return performScriptSafely(relayScriptName, filemakerParameter, callType)
    .then(function () {
      // Always resolve on ignoreResult
      if (ignoreResult) {
        resolveDeferred(promiseUUID);

        // Timeout rejection, if provided
      } else if (timeout) {
        setTimeout(function () {
          if (promiseMap.has(promiseUUID)) {
            rejectDeferred(
              promiseUUID,
              formattedClarisError(
                TIMEOUT_HIT,
                "Failed to resolve promise within " + timeout + "ms."
              )
            );
          }
        }, timeout);
      }
      return promise;
    })
    .catch(function (error) {
      rejectDeferred(promiseUUID, error);
      return promise;
    });
};

bzBond.SetRelayScriptName = function (relayScriptName) {
  GLOBAL_OPTIONS.relayScriptName.override = relayScriptName;
  return bzBond;
};

bzBond.SetWebViewerName = function (webViewerName) {
  GLOBAL_OPTIONS.webViewerName = webViewerName;
  return bzBond;
};

bzBond.GetRelayScriptName = function () {
  return (
    GLOBAL_OPTIONS.relayScriptName.override ||
    GLOBAL_OPTIONS.relayScriptName.default
  );
};

bzBond.GetWebViewerName = function () {
  return GLOBAL_OPTIONS.webViewerName;
};

bzBond.SetWebViewerNameFromClaris = function () {
  if (bzBond.GetWebViewerName()) {
    return Promise.resolve("");
  }
  return bzBond.PerformScript(bzBond.GetRelayScriptName(), {
    mode: MODE.GET_WEB_VIEWER_NAME,
  });
};

bzBond.GetWebViewerConfig = function () {
  return GLOBAL_OPTIONS.webViewerConfig;
};

bzBond.SetWebViewerConfig = function (webViewerConfig) {
  GLOBAL_OPTIONS.webViewerConfig = webViewerConfig;
  return bzBond;
};

bzBond.SetWebViewerConfigFromClaris = function () {
  return bzBond.SetWebViewerNameFromClaris()
    .then(() =>
      bzBond.PerformScript(bzBond.GetRelayScriptName(), {
        mode: MODE.GET_CONFIG,
        options: { webViewerName: bzBond.GetWebViewerName() },
      })
    )
    .then(bzBond.SetWebViewerConfig);
};

bzBond.SyncConfig = function () {
  return bzBond.SetWebViewerConfigFromClaris().then(() =>
    bzBond.GetWebViewerConfig()
  );
};

bzBond.RegisterScript = function (pluginOptions) {
  const { exec, scriptName, throwIf } = pluginOptions || {};
  const { INVALID_PARAMETER } = BZBOND_ERROR_CODE;

  if (typeof pluginOptions !== "object" || !exec || !scriptName) {
    throw formattedClarisError(
      INVALID_PARAMETER,
      "Invalid plugin parameters: { exec, scriptName } are required plugin options."
    );
  }
  if (bzBond[exec]) {
    throw formattedClarisError(
      INVALID_PARAMETER,
      "Unable to register " +
        exec +
        " as this method already exists. Please use a different name."
    );
  }

  const resultHandler = throwIf
    ? function (result) {
        if (throwIf(result)) {
          throw result;
        }
        return result;
      }
    : function (result) {
        return result;
      };

  bzBond[exec] = function (scriptParameter, options = {}) {
    return bzBond.PerformScript(scriptName, scriptParameter, options).then(
      resultHandler
    );
  };

  return bzBond;
};

/* --------------------------- Class Properties / Methods (Public/Private) ------------------------------------ */

/*
 * The result map is populated with a promiseUUID:{ ignoreResult, deffered } promise key-value pair.
 * We use this to handle the result returned by a FileMaker call.
 */
const promiseMap = new Map();

/*  Call Type - Constants & Internal Map */
const CALL_TYPE = {
  CONTINUE: "0",
  HALT: "1",
  EXIT: "2",
  RESUME: "3",
  PAUSE: "4",
  INTERRUPT: "5",
};
const callTypeMap = new Map();
callTypeMap
  .set(null, CALL_TYPE.CONTINUE)
  .set("null", CALL_TYPE.CONTINUE)
  .set(undefined, CALL_TYPE.CONTINUE)
  .set("undefined", CALL_TYPE.CONTINUE)
  .set("", CALL_TYPE.CONTINUE)
  .set(0, CALL_TYPE.CONTINUE)
  .set("0", CALL_TYPE.CONTINUE)
  .set("continue", CALL_TYPE.CONTINUE);
callTypeMap
  .set(1, CALL_TYPE.HALT)
  .set("1", CALL_TYPE.HALT)
  .set("halt", CALL_TYPE.HALT);
callTypeMap
  .set(2, CALL_TYPE.EXIT)
  .set("2", CALL_TYPE.EXIT)
  .set("exit", CALL_TYPE.EXIT);
callTypeMap
  .set(3, CALL_TYPE.RESUME)
  .set("3", CALL_TYPE.RESUME)
  .set("resume", CALL_TYPE.RESUME);
callTypeMap
  .set(4, CALL_TYPE.PAUSE)
  .set("4", CALL_TYPE.PAUSE)
  .set("pause", CALL_TYPE.PAUSE);
callTypeMap
  .set(5, CALL_TYPE.INTERRUPT)
  .set("5", CALL_TYPE.INTERRUPT)
  .set("interrupt", CALL_TYPE.INTERRUPT);

/* Default options used in every call. Can be overridden by the options parameter in .PerformScript */
const DEFAULT_CALL_OPTIONS = {
  /* null|number in milliseconds to wait before rejecting. */
  timeout: null,

  // False = Will return FileMaker's result as a promise
  // True = Will always return a resolved promise without waiting for FileMaker to execute
  ignoreResult: false,

  /*
    ~~~ The FileMaker 'call type': https://help.claris.com/en/pro-help/content/options-for-starting-scripts.html

    0 'continue'
    After a currently running FileMaker script has completed, queued FileMaker scripts are run in order.
    If FileMaker script execution is canceled, the queue is cleared.
    This is the behavior if option is not specified.
    This is also the default behavior for FileMaker.PerformScript() starting in version 19.1.2.

    1 'halt'
    Execution of a currently running FileMaker script is halted, and all other pending scripts (queued or in the call stack) are canceled.
    Then script is run.

    2 'exit'
    A currently paused FileMaker script is exited.
    If the currentFileMaker script was called by another FileMaker script, control returns to the calling FileMaker script until no more scripts remain in the call stack.
    Then script is run.

    3 'resume'
    A paused FileMaker script is resumed. After the resumed script is completed, script is run.

    4 'pause'
    A paused FileMaker script remains paused. If the paused script is resumed and completed, then script is run.

    5 'Interrupt'
    A currently running FileMaker script is interrupted and script is run.
    When script is completed, the interrupted script resumes with the next script step.
    A paused script remains paused while script is run.
    This is the original behavior of FileMaker.PerformScript() in version 19.0.0.
  */
  callType: CALL_TYPE.CONTINUE,
};

/* Options global to the web viewer instance */
const GLOBAL_OPTIONS = {
  webViewerName: "",
  relayScriptName: {
    default: "bzBondRelay",
    override: "",
  },
  webViewerConfig: {},
};

/* Modes that the relay script can be run in */
const MODE = {
  PERFORM_SCRIPT: "PERFORM_SCRIPT",
  GET_WEB_VIEWER_NAME: "GET_WEB_VIEWER_NAME",
  GET_CONFIG: "GET_CONFIG",
  RETURN_JAVASCRIPT_RESULT: "RETURN_JAVASCRIPT_RESULT",
};

const SAFETY_TIMEOUT_IN_MS = 1000;
const SAFETY_INTERVAL_IN_MS = 10;

function performScriptSafely(
  scriptName,
  scriptParameter,
  callType = CALL_TYPE.CONTINUE
) {
  const { PROCESS_ERROR, CLARIS_NOT_FOUND } = BZBOND_ERROR_CODE;
  const isFileMakerAvailable = function () {
    return typeof FileMaker !== "undefined";
  };

  const performScript = function () {
    return new Promise(function (resolve, reject) {
      if (typeof scriptParameter === "undefined" || scriptParameter === null) {
        scriptParameter = "";
      }
      if (typeof scriptParameter === "boolean") {
        scriptParameter = scriptParameter ? "1" : "0";
      }
      if (typeof scriptParameter !== "string") {
        scriptParameter = tryStringify(scriptParameter);
      }
      try {
        FileMaker.PerformScriptWithOption(scriptName, scriptParameter, callType);
        resolve();
      } catch (e) {
        reject(formattedClarisError(PROCESS_ERROR, e.message));
      }
    });
  };

  // Just perform script immediately if FileMaker object exists
  if (isFileMakerAvailable()) {
    return performScript();
  }

  // Otherwise, check in intervals until FileMaker object exists, then perform script
  return new Promise(function (resolve, reject) {
    const startTime = new Date().getTime();
    const interval = setInterval(function () {
      if (isFileMakerAvailable()) {
        clearInterval(interval);
        performScript().then(resolve).catch(reject);
      } else if (new Date().getTime() - SAFETY_TIMEOUT_IN_MS > startTime) {
        clearInterval(interval);
        reject(formattedClarisError(CLARIS_NOT_FOUND, "FileMaker object not found"));
      }
    }, SAFETY_INTERVAL_IN_MS);
  });
}

function handleCallFromRelayScript(ClarisResponse) {
  const { response, messages } = ClarisResponse;
  const { promiseUUID, scriptResult, webViewerName } = response;
  const { code, message } = messages[0];

  // Always update the webViewerName
  bzBond.SetWebViewerName(webViewerName);

  // Reject if some sort of Exceptional Error occurred in FileMaker
  if (code !== "0") {
    rejectDeferred(promiseUUID, formattedClarisError(code, message, response));
  } else {
    resolveDeferred(promiseUUID, tryParse(scriptResult));
  }
}

function handleJSCallFromClaris(functionName, functionArgArray = []) {
  const { INTERRUPT } = CALL_TYPE;
  const { RETURN_JAVASCRIPT_RESULT: mode } = MODE;
  const { INVALID_PARAMETER, PROCESS_ERROR } = BZBOND_ERROR_CODE;
  let result = formattedClarisResult();
  let thisFunction = null;
  try {
    if (functionName.indexOf("{") !== -1 || functionName.indexOf("=>") !== -1) {
      thisFunction = new Function("return " + functionName)();
    } else {
      thisFunction = eval(functionName);
    }
  } catch (e) {}
  if (typeof thisFunction !== "function") {
    result.messages[0].code = INVALID_PARAMETER;
    result.messages[0].message =
      "The function '" +
      functionName +
      "' either (a) is missing from the global scope, or (b) is not a valid function definition";
  } else {
    const formattedArgArray = functionArgArray.map(function (arg) {
      let newArg = arg;
      try {
        if (newArg[0] === "ƒ") {
          newArg = new Function("return " + newArg.slice(1))();
        } else {
          newArg = tryParse(arg);
        }
      } catch (e) {}
      return newArg;
    });
    try {
      result.response.result = thisFunction(...formattedArgArray);
    } catch (e) {
      result.messages[0].code = PROCESS_ERROR;
      result.messages[0].message = e.toString();
    }
  }
  const relayScriptName = bzBond.GetRelayScriptName();
  const param = {
    mode,
    result,
  };
  if (typeof window == "undefined") {
    return result;
  } else {
    performScriptSafely(relayScriptName, param, INTERRUPT);
  }
}

function resolveDeferred(promiseUUID, scriptResult) {
  if (promiseMap.has(promiseUUID)) {
    const { resolve } = promiseMap.get(promiseUUID);
    promiseMap.delete(promiseUUID);
    resolve(scriptResult);
  }
}

function rejectDeferred(promiseUUID, errorResult) {
  if (promiseMap.has(promiseUUID)) {
    const { reject } = promiseMap.get(promiseUUID);
    promiseMap.delete(promiseUUID);
    reject(errorResult);
  }
}

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Claris Result Formatting
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

const BZBOND_ERROR_CODE = {
  OK: "0",
  NO_NEW_KEYWORD: "-1",
  CLARIS_NOT_FOUND: "-2",
  INVALID_PARAMETER: "-3",
  TIMEOUT_HIT: "-4",
  PROCESS_ERROR: "-5",
  MISSING_PROMISE_UUID: "-6",
  MISSING_SCRIPT_NAME: "-7",
};
function formattedClarisResult(
  code = BZBOND_ERROR_CODE.OK,
  message = "OK",
  response = {}
) {
  return {
    messages: [{ code, message }],
    response,
  };
}
function formattedClarisError(code, message, response) {
  return new Error(JSON.stringify(formattedClarisResult(code, message, response)));
}

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Deferred Promise Handling
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

function deferredPromise() {
  this.promise = new Promise(
    function (resolve, reject) {
      this.reject = reject;
      this.resolve = resolve;
    }.bind(this)
  );
}

/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Utility Methods
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

let createUUID = (function () {
  const symbolArray = "0123456789abcdefghijklmnopqrstuvwxyz"
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    });
  return function () {
    let id = "";
    for (let i = 0; i < 32; i++) {
      id += symbolArray[Math.floor(Math.random() * symbolArray.length)];
    }
    return (
      id.substr(0, 8) +
      "-" +
      id.substr(8, 4) +
      "-" +
      id.substr(12, 4) +
      "-" +
      id.substr(16, 4) +
      "-" +
      id.substr(20, 12)
    );
  };
})();

/* Parse out the possibleJSON:
 *   • JSON Objects turn into Javascript Objects.
 *   • Numbers or numeric strings into numbers.
 *   • Alphanumeric Strings are left as strings.
 */
function tryParse(possibleJSON) {
  try {
    possibleJSON = JSON.parse(possibleJSON);
  } catch (e) {}
  return possibleJSON;
}

function tryStringify(possibleJSON) {
  if (typeof possibleJSON === "string") return possibleJSON;
  try {
    possibleJSON = JSON.stringify(possibleJSON);
  } catch (e) {}
  return possibleJSON;
}

/* Hoist to window/global level if available - quirk required because FileMaker */
if (typeof window !== "undefined") {
  window.bzBond = bzBond;

  // To allow WebDirect solutions to run the PerformJavaScript
  // function we have to create an "alias" to it
  window.bzBondPeformJavaScript = (func, arr) => bzBond.PerformJavaScript(func, arr);
}
if (typeof global !== "undefined") {
  global.bzBond = bzBond;

  // To allow WebDirect solutions to run the PerformJavaScript
  // function we have to create an "alias" to it
  global.bzBondPeformJavaScript = (func, arr) => bzBond.PerformJavaScript(func, arr);
}

module.exports = bzBond;
