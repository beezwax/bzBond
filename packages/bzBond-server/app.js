const fastify = require("fastify");
const routes = require("./routes.js");

const DEFAULT_OPTIONS = {
  logger: true,
};

const build = async ({ options = DEFAULT_OPTIONS, plugins = [] } = {}) => {
  const app = fastify(options);

  plugins.forEach((plugin) =>
    app.register(plugin.plugin, plugin.options || {})
  );

  app.register(routes);

  return app;
};

module.exports = build;
