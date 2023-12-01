const { expect } = require("chai");
const build = require("../app.js");

describe("routes", function () {
  describe("/code", function () {
    it("evaluates javascript", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "40 + 2",
        },
      });
      expect(JSON.parse(response.body).response.result).to.eq(42);
    });
  });

  describe("/function", function () {
    it("calls a function with no parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "() => 42",
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq(42);
    });

    it("calls a function with parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a, b) => a + b",
          arguments: [40, 2],
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq(42);
    });

    it("throws an error for an invalid function", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a) => a + b",
          arguments: [40, 2],
        },
      });

      expect(JSON.parse(response.body).messages[0].code).to.eq("500");
    });

    it("handles function parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a, b, c) => c(a + b)",
          arguments: [40, 2, "ƒ(x) => x * 2"],
        },
      });
      
      expect(JSON.parse(response.body).response.result).to.eq(84);
    });
  });
});
