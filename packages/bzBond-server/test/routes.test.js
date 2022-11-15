import { expect } from "chai";
import build from "../app.js";

describe("routes", function () {
  describe("/code", function () {
    it("evaluates javascript", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "2 + 2",
        },
      });

      expect(response.body).to.eq("4");
    });
  });

  describe("/function", function () {
    it("calls the function with no parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "foo",
        },
      });

      expect(JSON.parse(response.body).func).to.eq("foo");
    });

    it("calls the function with no parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "foo",
          arguments: ["bar", "baz"],
        },
      });

      const parsedResponse = JSON.parse(response.body);
      expect(parsedResponse.func).to.eq("foo");
      expect(parsedResponse.args[0]).to.eq("bar");
      expect(parsedResponse.args[1]).to.eq("baz");
    });
  });
});
