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

  // describe("/function", function () {
  //   it("executes a function using BzBond", async function () {
  //     const app = await build({ options: { logger: false } });
  //     const response = await app.inject({
  //       method: "POST",
  //       url: "/function",
  //       payload: {
  //         func: "foo",
  //       },
  //     });

  //     expect(response.body).to.eq("4");
  //   });
  // });
});
