const fastify = require("fastify");
const routes = require("./routes.js");

const DEFAULT_OPTIONS = {
  logger: true,
};

const build = async ({ options = DEFAULT_OPTIONS, microbonds = [] } = {}) => {
  const app = fastify(options);

  microbonds.forEach((microbond) =>
    app.register(microbond.microbond, microbond.options || {})
  );

  app.register(routes);

  return app;
};

module.exports = build;
