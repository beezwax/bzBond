import { expect } from "chai";
import build from "../app.js";

describe("routes", function () {
  describe("/code", function () {
    it("evaluates javascript", async function () {
      const app = await build({ logger: false });

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
});
