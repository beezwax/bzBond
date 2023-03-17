const { expect } = require("chai");
const build = require("../app.js");

describe("microbonds", function () {
  it("simple microbonds", async function () {
    const testMicrobond = {
      async microbond(fastify, options) {
        fastify.get("/my-microbond", (request, reply) => {
          return "dummy response";
        });
      },
      options: {},
    };

    const app = await build({
      options: { logger: false },
      microbonds: [testMicrobond],
    });

    const response = await app.inject({
      method: "GET",
      url: "/my-microbond",
    });

    expect(response.body).to.eq("dummy response");
  });
});
