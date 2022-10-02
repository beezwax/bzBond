const rewire = require("rewire");
const jsdom = require("jsdom");

/* Setup */
const PROMISE_UUID = "4q5bt4y8-339c-44d3-96aj-50ee623oc6az";
const WEB_VIEWER = "wv";
const RELAY_SCRIPT = "bzBondRelay";
const createClarisResponse = function (
  promiseUUID = "",
  scriptResult = "",
  webViewerName = "wv",
  code = "0",
  message = "OK"
) {
  return {
    response: {
      promiseUUID,
      scriptResult,
      webViewerName,
    },
    messages: [
      {
        code,
        message,
      },
    ],
  };
};

// Because of the quirk with bzBond hoisting itself to the window level,
// we need to define the window scope before importing bzBond.
let bzBondForWindow, bzBond;
beforeAll(() => {
  const { JSDOM } = jsdom;
  const { window } = new JSDOM("<!DOCTYPE html>");
  global.window = window;
  global.document = window.document;
  // First 'require' bzBond
  bzBondForWindow = require("../bzBond");
  // Second 'rewire' bzBond
  bzBond = rewire("../bzBond");
  bzbondWindow = bzBond.__set__("window", jest.fn());
});
afterAll(() => {
  bzbondWindow();
});

/*
 * ~~~~~~~~~~~~~~~~~~ TESTS ~~~~~~~~~~~~~~~~~~
 */

describe("bzBond call parameters", () => {
  test("new keyword throws error", () => {
    expect.assertions(1);
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const { NO_NEW_KEYWORD } = bzBond.__get__("BZBOND_ERROR_CODE");
    const expectedError = formattedClarisError(
      NO_NEW_KEYWORD,
      "Use of the new keyword is prohibited with bzBond"
    );
    expect(() => new bzBond()).toThrow(expectedError);
  });

  test("no parameters should return undefined", () => {
    expect.assertions(1);
    expect(bzBond()).not.toBeDefined();
  });

  test("non-string should return undefined", () => {
    expect.assertions(1);
    expect(bzBond({ test: "test" })).not.toBeDefined();
  });

  test("no-length string should return undefined", () => {
    expect.assertions(1);
    expect(bzBond("")).not.toBeDefined();
  });

  /*  This test simulates a situation where the response from Claris is given to a web viewer
      that does contain bzBond, however was not the original web viewer the call to Claris
      came from. We purposefully throw here so that our Claris script knows that it failed. */
  test("bzBond called with object with non-existent response.promiseUUID throws error", () => {
    expect.assertions(1);
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
    const param = JSON.stringify(createClarisResponse("non-existent-uuid-123"));
    const expectedError = formattedClarisError(
      INVALID_PARAMETER,
      "bzBond was called with an invalid a promiseUUID"
    );
    expect(() => bzBond(param)).toThrow(expectedError);
  });

  test("valid bzResponse should perform handleCallFromRelayScript", () => {
    // setup
    const spy = jest.fn();
    const resetHandleCallFromRelayScript = bzBond.__set__(
      "handleCallFromRelayScript",
      spy
    );
    const resetCreateUUID = bzBond.__set__("createUUID", () => PROMISE_UUID);
    const resetPerformScriptSafely = bzBond.__set__("performScriptSafely", () =>
      Promise.resolve()
    );
    const responseObj = createClarisResponse(PROMISE_UUID);
    const responseStr = JSON.stringify(responseObj);

    // test
    expect.assertions(2);
    bzBond.PerformScript("a");
    bzBond(responseStr);
    expect(spy).toHaveBeenCalledWith(responseObj);
    expect(spy).toHaveBeenCalledTimes(1);

    // cleanup
    resetHandleCallFromRelayScript();
    resetCreateUUID();
    resetPerformScriptSafely();
  });

  test("valid Claris Request should perform handleJSCallFromClaris", () => {
    // setup
    const spy = jest.fn();
    const resetHandleJSCallFromClaris = bzBond.__set__("handleJSCallFromClaris", spy);
    const validJSRequestParams = [
      ["a"],
      ["a", 1, 2, 3],
      ["() => 'hey'"],
      ["(a,b) => a*b", 5, 10],
    ];

    // test
    expect.assertions(validJSRequestParams.length + 1);
    validJSRequestParams.forEach((req) => {
      const [jsFunc, ...rest] = req;
      bzBond(jsFunc, ...rest);
      expect(spy).toHaveBeenLastCalledWith(jsFunc, rest);
    });
    expect(spy).toHaveBeenCalledTimes(validJSRequestParams.length);

    // cleanup
    resetHandleJSCallFromClaris();
  });
});

describe("PerformScript", () => {
  let resetCreateUUID, resetPerformScriptSafely;
  beforeAll(() => {
    resetCreateUUID = bzBond.__set__("createUUID", () => PROMISE_UUID);
    resetPerformScriptSafely = bzBond.__set__("performScriptSafely", () =>
      Promise.resolve()
    );
  });
  afterAll(() => {
    resetCreateUUID();
    resetPerformScriptSafely();
  });
  beforeEach(() => {
    bzBond.__get__("promiseMap").clear();
    bzBond.SetWebViewerName("");
  });

  test("should return js-formatted script results as resolved promises", () => {
    // setup
    const promiseMap = bzBond.__get__("promiseMap");
    const scriptResultTests = [
      {
        fromClaris: "",
        expectedPromiseResult: "",
        toBe: "toBe",
      },
      {
        fromClaris: "1",
        expectedPromiseResult: 1,
        toBe: "toBe",
      },
      {
        fromClaris: "1.2",
        expectedPromiseResult: 1.2,
        toBe: "toBe",
      },
      {
        fromClaris: "test",
        expectedPromiseResult: "test",
        toBe: "toMatch",
      },
      {
        fromClaris: '[100,"200","abc"]',
        expectedPromiseResult: [100, "200", "abc"],
        toBe: "toMatchObject",
      },
      {
        fromClaris: '{"a": "b", "c":[1,2,3], "d": { "e": 1000, "f": ["g", "h"] }}',
        expectedPromiseResult: {
          a: "b",
          c: [1, 2, 3],
          d: { e: 1000, f: ["g", "h"] },
        },
        toBe: "toMatchObject",
      },
    ];
    // test
    expect.assertions(scriptResultTests.length * 4);
    scriptResultTests.forEach(async (test, idx) => {
      const { fromClaris, expectedPromiseResult, toBe } = test;
      const responseStr = JSON.stringify(
        createClarisResponse(PROMISE_UUID, fromClaris, WEB_VIEWER)
      );

      expect(bzBond.GetWebViewerName()).toMatch(idx === 0 ? "" : WEB_VIEWER);
      expect(promiseMap.get(PROMISE_UUID)).not.toBeDefined();
      const deferredPromise = bzBond.PerformScript("a");
      expect(promiseMap.get(PROMISE_UUID)).toBeDefined();
      bzBond(responseStr);
      await deferredPromise;
      expect(deferredPromise).resolves[toBe](expectedPromiseResult);
    });
  });

  test("invalid script name should throw", async () => {
    // setup
    const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const expectedResult = formattedClarisError(
      INVALID_PARAMETER,
      "The script name parameter must be a valid string"
    );
    const invalidScriptNames = ["", { test: "hey" }, undefined, null];

    // test
    expect.assertions(invalidScriptNames.length);
    invalidScriptNames.forEach((scriptName) => {
      expect(() => bzBond.PerformScript(scriptName)).toThrow(expectedResult);
    });
  });

  test("missing relay script name should throw", async () => {
    // setup
    const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const expectedResult = formattedClarisError(
      INVALID_PARAMETER,
      "The script name parameter must be a valid string"
    );
    const invalidScriptNames = ["", { test: "hey" }, undefined, null];

    // test
    expect.assertions(invalidScriptNames.length);
    invalidScriptNames.forEach((scriptName) => {
      expect(() => bzBond.PerformScript(scriptName)).toThrow(expectedResult);
    });
  });

  describe("Options are handled correctly", () => {
    test("timeouts throw", async () => {
      // setup
      const { TIMEOUT_HIT } = bzBond.__get__("BZBOND_ERROR_CODE");
      const formattedClarisError = bzBond.__get__("formattedClarisError");
      const expectedResult = formattedClarisError(
        TIMEOUT_HIT,
        "Failed to resolve promise within 10ms."
      );

      // test
      expect.assertions(1);
      return expect(
        bzBond.PerformScript("a", "", { timeout: 10 })
      ).rejects.toThrow(expectedResult);
    });

    test("ignore result option should resolve, even with timeout", () => {
      expect.assertions(1);
      return expect(
        bzBond.PerformScript("a", "", { ignoreResult: true, timeout: 1 })
      ).resolves.not.toBeDefined();
    });

    test("valid callTypes", async () => {
      // setup
      validCallTypes = [
        null,
        "null",
        undefined,
        "undefined",
        "",
        0,
        "0",
        "continue",
        1,
        "1",
        "halt",
        2,
        "2",
        "exit",
        3,
        "3",
        "resume",
        4,
        "4",
        "pause",
        5,
        "5",
        "interrupt",
      ];
      // test - since there are two methods of sending callType, we test for all valid types * 2
      expect.assertions(validCallTypes.length * 2);
      const tests = validCallTypes.map(async (callType, idx) => {
        const uuid1 = `uuid1-${idx}`;
        const uuid2 = `uuid2-${idx}`;
        let secondCall = false;
        bzBond.__set__("createUUID", () => {
          secondCall = !secondCall;
          return secondCall ? uuid2 : uuid1;
        });
        // two methods of sending callType
        const promise1 = bzBond.PerformScript("a", "", callType);
        const promise2 = bzBond.PerformScript("a", "", { callType });
        bzBond(JSON.stringify(createClarisResponse(uuid1)));
        bzBond(JSON.stringify(createClarisResponse(uuid2)));
        return Promise.all([
          expect(promise1).resolves.toMatch(""),
          expect(promise2).resolves.toMatch(""),
        ]);
      });
      const allRun = await Promise.all(tests);
      // cleanup
      bzBond.__set__("createUUID", () => PROMISE_UUID);
      return allRun;
    });

    test("invalid callTypes", async () => {
      // setup
      const invalidCallTypes = [
        "invalidString",
        "999",
        999,
        { callType: "invalid" },
        { callType: "999" },
        { callType: 999 },
        { callType: { callType: "invalid" } },
      ];
      const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
      const formattedClarisError = bzBond.__get__("formattedClarisError");
      const expectedResult = (myString) =>
        formattedClarisError(
          INVALID_PARAMETER,
          `${myString} is not a valid call type. Please use options 0 - 5`
        );
      // tests
      expect.assertions(invalidCallTypes.length);
      invalidCallTypes.forEach((callType) => {
        let expectedCallType =
          typeof callType === "object" ? callType.callType : callType;
        const expected = expectedResult(`${expectedCallType}`.toLowerCase());
        expect(() => bzBond.PerformScript("a", "", callType)).toThrow(expected);
      });
    });
  });
});

describe("RegisterScript", () => {
  test("invalid parameters", () => {
    // setup
    const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const expectedError = formattedClarisError(
      INVALID_PARAMETER,
      "Invalid plugin parameters: { exec, scriptName } are required plugin options."
    );
    const invalidParams = [
      "",
      "test",
      {},
      { exec: "", scriptName: "test" },
      { exec: "test", scriptName: "" },
      undefined,
      null,
    ];
    // test
    expect.assertions(invalidParams.length);
    invalidParams.forEach((param) => {
      expect(() => bzBond.RegisterScript(param)).toThrow(expectedError);
    });
  });

  test("registering a method that already exists should throw", () => {
    // setup
    const { INVALID_PARAMETER } = bzBond.__get__("BZBOND_ERROR_CODE");
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const expectedError = formattedClarisError(
      INVALID_PARAMETER,
      "Unable to register PerformScript as this method already exists. Please use a different name."
    );
    // test
    expect.assertions(1);
    expect(() =>
      bzBond.RegisterScript({ exec: "PerformScript", scriptName: "test" })
    ).toThrow(expectedError);
  });

  test("registering works normally", () => {
    // setup
    bzBond.SetWebViewerName("wv");
    const spy = jest.fn(() => Promise.resolve());
    const fileMakerParams = {
      promiseUUID: PROMISE_UUID,
      mode: "PERFORM_SCRIPT",
      options: {
        callType: "interrupt",
        ignoreResult: false,
        webViewerName: "wv",
      },
      script: {
        name: "My FileMaker Script",
        parameter: "my parameter",
      },
    };
    const resetPerformScriptSafely = bzBond.__set__("performScriptSafely", spy);
    const resetCreateUUID = bzBond.__set__("createUUID", () => PROMISE_UUID);
    // test
    expect.assertions(7);
    expect(bzBond.Run).not.toBeDefined();
    expect(
      bzBond.RegisterScript({
        exec: "Run",
        scriptName: "My FileMaker Script",
        throwIf: (res) => res === "NoCanDo!",
      })
    ).toBe(bzBond);
    expect(bzBond.Run).toBeDefined();
    // test good result
    const goodResult = bzBond.Run("my parameter", "interrupt");
    expect(spy).toHaveBeenCalledWith(RELAY_SCRIPT, fileMakerParams, "5");
    bzBond(JSON.stringify(createClarisResponse(PROMISE_UUID, "YesWeCan!")));
    expect(goodResult).resolves.toMatch("YesWeCan!");
    // test result that throws
    const thrownResult = bzBond.Run("my parameter", "interrupt");
    expect(spy).toHaveBeenCalledWith(RELAY_SCRIPT, fileMakerParams, "5");
    bzBond(JSON.stringify(createClarisResponse(PROMISE_UUID, "NoCanDo!")));
    expect(thrownResult).rejects.toMatch("NoCanDo!");
    // cleanup
    resetCreateUUID();
    resetPerformScriptSafely();
    bzBond.SetWebViewerName("");
  });
});

describe("handleJSCallFromClaris", () => {
  test("valid parameters", async () => {
    // setup
    bzBond.SetRelayScriptName("r");
    const performScriptSafelySpy = jest.fn();
    const resetPerformScriptSafely = bzBond.__set__(
      "performScriptSafely",
      performScriptSafelySpy
    );

    // a valid parameter is a correctly-defined js function
    const validJSRequestParams = [
      {
        request: ["Math.max", 1, 10],
        expectedResult: 10,
      },
      {
        request: ["(a) => a", '{ "object": "test" }'],
        expectedResult: { object: "test" },
      },
      {
        request: ["Math.min", 1, 10],
        expectedResult: 1,
      },
      {
        request: ["() => 'hey'"],
        expectedResult: "hey",
      },
      {
        request: ["(a,b) => { return `${a}_${b}`; }", "my", "milkshake"],
        expectedResult: "my_milkshake",
      },
      {
        request: [
          "function(callback, param) { return callback(param); }",
          "ƒ(param) => { return param.toUpperCase() }",
          "milkshake",
        ],
        expectedResult: "MILKSHAKE",
      },
    ];

    // test
    expect.assertions(validJSRequestParams.length * 2);
    validJSRequestParams.forEach((req) => {
      const { request, expectedResult } = req;
      const [jsFunc, ...rest] = request;
      const result = bzBond(jsFunc, ...rest);
      const param = {
        mode: "RETURN_JAVASCRIPT_RESULT",
        result: {
          messages: [
            {
              code: "0",
              message: "OK",
            },
          ],
          response: {
            result: expectedResult,
          },
        },
      };
      expect(performScriptSafelySpy).toHaveBeenLastCalledWith("r", param, "5");
      expect(result).not.toBeDefined();
    });

    // cleanup
    bzBond.SetRelayScriptName("");
    resetPerformScriptSafely();
  });

  test("invalid parameters", async () => {
    // setup
    bzBond.SetRelayScriptName("r");
    const performScriptSafelySpy = jest.fn();
    const resetPerformScriptSafely = bzBond.__set__(
      "performScriptSafely",
      performScriptSafelySpy
    );

    // an invalid parameter is any incorrectly-defined js function
    const invalidJSRequestParams = [
      ["a"],
      ["a(", 1, 2, 3],
      ["( => 'hey'"],
      ["function(a,b) => a*b", 5, 10],
      ["function(a,b)", 5, 10],
      ["function(a,b) { return `${a}_${b}`", 5, 10],
      ["fuction(a,b) { return `${a}_${b}` }", 5, 10],
      ["Math.idonotexist", 5, 10],
    ];

    // test
    expect.assertions(invalidJSRequestParams.length);
    invalidJSRequestParams.forEach((req) => {
      const [jsFunc, ...rest] = req;
      bzBond(jsFunc, ...rest);
      const param = {
        mode: "RETURN_JAVASCRIPT_RESULT",
        result: {
          messages: [
            {
              code: "-3",
              message: `The function '${jsFunc}' either (a) is missing from the global scope, or (b) is not a valid function definition`,
            },
          ],
          response: {},
        },
      };
      expect(performScriptSafelySpy).toHaveBeenLastCalledWith("r", param, "5");
    });

    // cleanup
    bzBond.SetRelayScriptName("");
    resetPerformScriptSafely();
  });

  test("function throws are handled", async () => {
    // setup
    bzBond.SetRelayScriptName("r");
    const performScriptSafelySpy = jest.fn();
    const resetPerformScriptSafely = bzBond.__set__(
      "performScriptSafely",
      performScriptSafelySpy
    );
    let expectedError;
    try {
      JSON.parse("{");
    } catch (e) {
      expectedError = e.toString();
    }
    const param = {
      mode: "RETURN_JAVASCRIPT_RESULT",
      result: {
        messages: [
          {
            code: "-5",
            message: expectedError,
          },
        ],
        response: {},
      },
    };

    // test
    expect.assertions(1);
    bzBond("JSON.parse", "{");
    expect(performScriptSafelySpy).toHaveBeenLastCalledWith("r", param, "5");

    // cleanup
    bzBond.SetRelayScriptName("");
    resetPerformScriptSafely();
  });
  test("Node.js server returns result", async () => {
    // setup
    const performScriptSafelySpy = jest.fn();
    const resetPerformScriptSafely = bzBond.__set__(
      "performScriptSafely",
      performScriptSafelySpy
    );
    // undefine the window
    const oldWindow = bzBond.__get__("window");
    bzBond.__set__("window", undefined);

    // test
    expect.assertions(3);
    const expectedResult1 = {
      messages: [{ code: "0", message: "OK" }],
      response: { result: 10 },
    };
    const expectedResult2 = {
      messages: [
        {
          code: "-5",
          message: "SyntaxError: Unexpected end of JSON input",
        },
      ],
      response: {},
    };
    const result1 = bzBond("(a) => a + 9", "1");
    expect(result1).toEqual(expectedResult1);
    const result2 = bzBond("JSON.parse", "{");
    expect(result2).toEqual(expectedResult2);
    expect(performScriptSafelySpy).not.toHaveBeenCalled();
    // cleanup
    bzBond.__set__("window", oldWindow);
    resetPerformScriptSafely();
  });
});

describe("Getters & Setters", () => {
  beforeEach(() => {
    bzBond.SetRelayScriptName("");
    bzBond.SetWebViewerName("");
    bzBond.SetWebViewerConfig({});
  });
  afterAll(() => {
    bzBond.SetRelayScriptName(RELAY_SCRIPT);
    bzBond.SetWebViewerName(WEB_VIEWER);
    bzBond.SetWebViewerConfig({});
  });

  test("web viewer name", () => {
    expect.assertions(3);
    expect(bzBond.GetWebViewerName()).toMatch("");
    expect(bzBond.SetWebViewerName("test")).toEqual(bzBond);
    expect(bzBond.GetWebViewerName()).toMatch("test");
  });

  test("relay script name", () => {
    expect.assertions(3);
    // Defaults to RELAY_SCRIPT when not set
    expect(bzBond.GetRelayScriptName()).toMatch(RELAY_SCRIPT);
    expect(bzBond.SetRelayScriptName("test")).toEqual(bzBond);
    expect(bzBond.GetRelayScriptName()).toMatch("test");
  });

  test("web viewer config", () => {
    expect.assertions(3);
    const expectedConfig = {
      my: "config",
    };
    expect(bzBond.GetWebViewerConfig()).toMatchObject({});
    expect(bzBond.SetWebViewerConfig(expectedConfig)).toEqual(bzBond);
    expect(bzBond.GetWebViewerConfig()).toMatchObject({
      my: "config",
    });
  });

  test("SetWebViewerNameFromClaris when name is already set", () => {
    // setup
    bzBond.SetWebViewerName("wvNameWhenAlreadySet");

    // test - when name is already set
    expect.assertions(2);
    return bzBond.SetWebViewerNameFromClaris().then((res) => {
      expect(res).toMatch("");
      expect(bzBond.GetWebViewerName()).toMatch("wvNameWhenAlreadySet");
    });
  });

  test("SetWebViewerNameFromClaris when name not set", () => {
    // setup
    const performScriptSafelySpy = jest.fn(() => Promise.resolve());
    const resetPerformScriptSafely = bzBond.__set__(
      "performScriptSafely",
      performScriptSafelySpy
    );
    const resetCreateUUID = bzBond.__set__("createUUID", () => PROMISE_UUID);
    const clarisReponse = JSON.stringify(
      createClarisResponse(PROMISE_UUID, "", "testWVname")
    );
    bzBond.SetRelayScriptName("testRelayScriptName");

    // test
    expect.assertions(5);
    expect(bzBond.GetWebViewerName()).toMatch("");
    const promise = bzBond.SetWebViewerNameFromClaris();
    bzBond(clarisReponse);
    return promise.then((res) => {
      expect(res).toMatch("");
      expect(bzBond.GetWebViewerName()).toMatch("testWVname");
      expect(performScriptSafelySpy).toHaveBeenCalledTimes(1);
      expect(performScriptSafelySpy).toHaveBeenCalledWith(
        "testRelayScriptName",
        {
          mode: "PERFORM_SCRIPT",
          options: { ignoreResult: false, webViewerName: "" },
          promiseUUID: PROMISE_UUID,
          script: {
            name: "testRelayScriptName",
            parameter: { mode: "GET_WEB_VIEWER_NAME" },
          },
        },
        "0"
      );

      // cleanup
      resetPerformScriptSafely();
      resetCreateUUID();
    });
  });

  test("Sync Config", () => {
    // setup
    const config = {
      my: "config",
    };
    const clarisReponse = Promise.resolve(config);
    // PS = PerformScript
    const PSspy = jest.fn(() => Promise.resolve(clarisReponse));
    const resetPS = bzBond.__set__("bzBond.PerformScript", PSspy);
    bzBond.SetWebViewerName("wvName");
    bzBond.SetRelayScriptName("rName");
    // test
    expect.assertions(5);
    expect(bzBond.GetWebViewerName()).toMatch("wvName");
    expect(bzBond.GetWebViewerConfig()).toMatchObject({});
    return bzBond.SyncConfig().then((res) => {
      const expectedConfig = {
        my: "config",
      };
      expect(res).toEqual(expectedConfig);
      expect(bzBond.GetWebViewerConfig()).toMatchObject(expectedConfig);
      expect(PSspy).toHaveBeenCalledWith("rName", {
        mode: "GET_CONFIG",
        options: { webViewerName: "wvName" },
      });
      // cleanup
      resetPS();
    });
  });
});

describe("Private utility methods work as intended", () => {
  describe("performScriptSafely", () => {
    test("works regularly", () => {
      // setup
      const FileMaker = function () {};
      FileMaker.PerformScript = jest.fn();
      FileMaker.PerformScriptWithOption = jest.fn();
      const resetFileMaker = bzBond.__set__("FileMaker", FileMaker);
      const performScriptSafely = bzBond.__get__("performScriptSafely");

      // test
      expect.assertions(3);
      expect(performScriptSafely("a", "b")).resolves.not.toBeDefined();
      expect(FileMaker.PerformScript).not.toHaveBeenCalled();
      expect(FileMaker.PerformScriptWithOption).toHaveBeenCalledWith(
        "a",
        "b",
        "0"
      );
      // cleanup
      resetFileMaker();
    });

    test("Throws when FileMaker object is not available within 1000ms", async () => {
      // setup
      jest.useFakeTimers();
      const performScriptSafely = bzBond.__get__("performScriptSafely");
      const formattedClarisError = bzBond.__get__("formattedClarisError");
      const { CLARIS_NOT_FOUND } = bzBond.__get__("BZBOND_ERROR_CODE");
      const expectedError = formattedClarisError(
        CLARIS_NOT_FOUND,
        "FileMaker object not found"
      );

      // test
      expect.assertions(1);
      const promise = performScriptSafely("a", "b");
      jest.advanceTimersByTime(1110);
      jest.useRealTimers();
      return expect(promise).rejects.toThrow(expectedError);
    });

    test("Safely waits for FileMaker to become available within 1000ms", async () => {
      // setup
      let runSetInterval;
      const setIntervalSpy = jest.fn((callback) => {
        runSetInterval = jest.fn(() => callback());
      });
      const resetSetInterval = bzBond.__set__("setInterval", setIntervalSpy);
      const FileMaker = function () {};
      FileMaker.PerformScriptWithOption = jest.fn();
      const performScriptSafely = bzBond.__get__("performScriptSafely");

      // test
      expect.assertions(6);
      expect(bzBond.FileMaker).not.toBeDefined();
      const pendingPromise = performScriptSafely("a", "b");
      // simulate the passing of 50 milliseconds
      for (let i = 0; i < 50; i++) {
        runSetInterval();
      }
      expect(runSetInterval).toHaveBeenCalledTimes(50);
      expect(FileMaker.PerformScriptWithOption).not.toHaveBeenCalled();
      // simulate FileMaker being available in the global scope
      const resetFileMaker = bzBond.__set__("FileMaker", FileMaker);
      // simulate the passing of 1 more millisecond
      runSetInterval();
      expect(FileMaker.PerformScriptWithOption).toHaveBeenCalledTimes(1);
      expect(FileMaker.PerformScriptWithOption).toHaveBeenCalledWith(
        "a",
        "b",
        "0"
      );
      await pendingPromise;
      expect(pendingPromise).resolves.not.toBeDefined();
      resetSetInterval();
      resetFileMaker();
    });
  });

  test("formattedClarisError", () => {
    // setup
    const expected = new Error(
      JSON.stringify({
        messages: [
          {
            code: "1",
            message: "test message",
          },
        ],
        response: { test: "TEST" },
      })
    );
    const formattedClarisError = bzBond.__get__("formattedClarisError");
    const received = formattedClarisError("1", "test message", { test: "TEST" });
    // test
    expect.assertions(1);
    expect(received.message).toMatch(expected.message);
  });

  test("createUUID", () => {
    expect.assertions(1);
    const createUUID = bzBond.__get__("createUUID");
    expect(createUUID()).toMatch(
      /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/
    );
  });

  test("tryParse / tryStringify", () => {
    expect.assertions(6);
    const tryStringify = bzBond.__get__("tryStringify");
    const tryParse = bzBond.__get__("tryParse");
    const testStr = '{"abc":123}';
    const testObj = { abc: 123 };
    expect(tryParse(testStr)).toMatchObject(testObj);
    expect(tryParse(testObj)).toMatchObject(testObj);
    expect(tryStringify(testObj)).toBe(testStr);
    expect(tryStringify(testStr)).toBe(testStr);
    expect(tryStringify(1)).toBe("1");
    expect(tryStringify([1, 2, 3])).toBe("[1,2,3]");
  });
});

describe("Scopes", () => {
  test("Window & Global scopes have bzBond defined", () => {
    expect.assertions(4);
    expect(global.window).toHaveProperty("bzBond");
    expect(global.window.bzBond).toBe(bzBondForWindow);
    expect(global).toHaveProperty("bzBond");
    expect(global.bzBond).toBe(bzBondForWindow);
  });
});
