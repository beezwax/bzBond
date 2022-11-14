import { VM } from "vm2";
import bzBond from "@beezwax/bzbond-js";

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
      const timeout = request.body.timeout
        ? Math.min(MAX_TIMEOUT, request.body.timeout)
        : MAX_TIMEOUT;
      const argumentString = JSON.stringify(request.body.arguments);
      const vm = new VM({
        timeout,
        allowAsync: false,
        sandbox: {
          bzBond,
          func,
        },
      });
      return vm.run(`bzBond(func, ...${argumentString})`);
    }
  );

  fastify.post(
    "/code",
    { schema: codeSchema, bodyLimit: BODY_LIMIT },
    (request, reply) => {
      const timeout = request.body.timeout
        ? Math.min(MAX_TIMEOUT, request.body.timeout)
        : MAX_TIMEOUT;
      const vm = new VM({
        timeout,
        allowAsync: false,
      });
      return vm.run(request.body.jsCode);
    }
  );
}

export default routes;
