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

    it("evaluates defined javascript functions", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "function sum(a, b) {return a + b}; sum(40, 2);",
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq(42);
    });

    it("evaluates defined javascript functions with backticks", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "function sum(a, b) {return `Sum is ${a + b}`}; sum(40, 2);",
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq("Sum is 42");
    });

    it("evaluates defined javascript functions with quotes", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "function sum(a, b) {return \"Sum is \" + a + b;}; sum(40, 2);",
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq("Sum is 402");
    });

    it("removes access to the process variable", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "process.env;",
        },
      });

      expect(JSON.parse(response.body).messages[0].code).to.eq("500");
    });

    it("removes access to the process variable in a defined function", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/code",
        payload: {
          jsCode: "function getProcess() { return process.env } getProcess();",
        },
      });

      expect(JSON.parse(response.body).messages[0].code).to.eq("500");
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

    it("supports string parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a, b) => a + b",
          arguments: ["40", "2"],
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq("402");
    });

    it("supports strings in functions with parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a, b) => { const c = \"d\"; return a + b + c; }",
          arguments: ["40", "2"],
        },
      });

      expect(JSON.parse(response.body).response.result).to.eq("402d");
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

    it("supports the let keyword", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(a) => { let b = a * 2; return b; }",
          arguments: [21],
        },
      });
      
      expect(JSON.parse(response.body).response.result).to.eq(42);
    });

    it("supports backticks", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "() => {const a = 'val'; return `a\\`s\\`${a}\"\"`;}",
        },
      });
      
      expect(JSON.parse(response.body).response.result).to.eq("a`s`val\"\"");
    });

    it("supports quotes", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "() => {const a = \"val\"; return `a\\`s\\`${a}\"\"`;}",
        },
      });
      
      expect(JSON.parse(response.body).response.result).to.eq("a`s`val\"\"");
    });

    it("removes access to the process variable", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "() => process.env"
        },
      });
      
      expect(JSON.parse(response.body).messages[0].code).to.eq("500");
    });

    it("removes access to the process variable in function parameters", async function () {
      const app = await build({ options: { logger: false } });

      const response = await app.inject({
        method: "POST",
        url: "/function",
        payload: {
          func: "(f) => f()",
          arguments: ["ƒ() => process.env"]
        },
      });
      
      expect(JSON.parse(response.body).messages[0].code).to.eq("500");
    });
  });
});
