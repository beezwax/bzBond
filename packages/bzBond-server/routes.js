require("ses");
lockdown();
const vm = require("vm");

const MAX_TIMEOUT = 45000;
const BODY_LIMIT = 104857600;

const functionSchema = {
  body: {
    type: "object",
    required: ["func"],
    properties: {
      func: { type: "string", minLength: 1 },
      arguments: { type: "array" },
      timeout: { type: "number" },
    },
  },
};

const codeSchema = {
  body: {
    type: "object",
    required: ["jsCode"],
    properties: {
      jsCode: { type: "string", minLength: 1 },
      timeout: { type: "number" },
    },
  },
};

async function routes(fastify, options) {
  fastify.post(
    "/function",
    { schema: functionSchema, bodyLimit: BODY_LIMIT },
    (request, reply) => {
      const a = new Compartment({fn: request.body.func});
      const func = a.evaluate(`new Function("return " + fn)()`);
      const timeout = request.body.timeout
        ? Math.min(MAX_TIMEOUT, request.body.timeout)
        : MAX_TIMEOUT;
      
      if (request.body.arguments) {
        const arguments = request.body.arguments;
        const params = arguments.map(arg => {
          if (typeof arg === "string" && arg.substring(0, 1) === "ƒ") {
            const b = new Compartment({fn: arg.slice(1)});
            return b.evaluate(`new Function("return " + fn)()`);
          } else {
            return arg;
          }
        });
        const c = new Compartment({
          Math,
          Date,
          atob,
          btoa,
          func,
          params
        });
        try {
          const result = vm.runInNewContext(`c.evaluate("func(...params)")`, {c}, {timeout});
          return {
            messages: [
              {
                message: "Ok",
                code: "0"
              }
            ],
            response: {
              result
            }
          };
        } catch (error) {
          return {
            messages: [
              {
                message: error.toString(),
                code: "500"
              }
            ],
            response: {
              result: ""
            }
          };
        }
      } else {
        const c = new Compartment({
          Math,
          Date,
          atob,
          btoa,
          func
        });
        try {
          const result = vm.runInNewContext(`c.evaluate("func()")`, {c}, {timeout});
          return {
            messages: [
              {
                message: "Ok",
                code: "0"
              }
            ],
            response: {
              result
            }
          };
        } catch (error) {
          return {
            messages: [
              {
                message: error.toString(),
                code: "500"
              }
            ],
            response: {
              result: ""
            }
          };
        }
      }
    }
  );

  fastify.post(
    "/code",
    { schema: codeSchema, bodyLimit: BODY_LIMIT },
    (request, reply) => {
      const timeout = request.body.timeout
        ? Math.min(MAX_TIMEOUT, request.body.timeout)
        : MAX_TIMEOUT;

      const script = new vm.Script(request.body.jsCode);

      const c = new Compartment({
        Math,
        Date,
        atob,
        btoa,
        script,
        timeout
      });
      try {
        const result = c.evaluate(`script.runInNewContext({}, {timeout})`);
        return result;
      } catch (error) {
        return {
          messages: [
            {
              message: error.toString(),
              code: "500"
            }
          ],
          response: {
            result: ""
          }
        };
      }
    }
  );
}

module.exports = routes;
