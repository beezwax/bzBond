import { expect } from "chai";
import build from "../app.js";

describe("plugins", function () {
  it("simple plugins", async function () {
    const testPlugin = {
      async plugin(fastify, options) {
        fastify.get("/my-plugin", (request, reply) => {
          return "dummy response";
        });
      },
      options: {},
    };

    const app = await build({
      options: { logger: false },
      plugins: [testPlugin],
    });

    const response = await app.inject({
      method: "GET",
      url: "/my-plugin",
    });

    expect(response.body).to.eq("dummy response");
  });
});
