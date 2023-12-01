const vm = require("vm");
const ses = require("ses");

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
      const func = request.body.func;
      // const params = request.body.arguments ? JSON.parse(request.body.arguments) : [];
      const timeout = request.body.timeout
        ? Math.min(MAX_TIMEOUT, request.body.timeout)
        : MAX_TIMEOUT;
      
      if (request.body.arguments) {
        const arguments = request.body.arguments;
        const params = arguments.map(arg => {
          if (typeof arg === "string" && arg.substring(0, 1) === "ƒ") {
            return new Function("return " + arg.slice(1))();
          } else {
            return arg;
          }
        });
        const c = new Compartment({
          Math,
          Date,
          atob,
          btoa,
          params
        });
        try {
          const result = vm.runInNewContext(c.evaluate(`(${func})(...params)`, {c}, {timeout}));
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
          btoa
        });
        try {
          const result = vm.runInNewContext(c.evaluate(`(${func})()`, {c}, {timeout}));
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

      const c = new Compartment({
        Math,
        Date,
        atob,
        btoa
      });
      try {
        const result = vm.runInNewContext(c.evaluate(request.body.jsCode), {c}, {timeout});
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
  );
}

module.exports = routes;
