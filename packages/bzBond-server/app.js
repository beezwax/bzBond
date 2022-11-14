import fastify from "fastify";
import routes from "./routes.js";

const DEFAULT_OPTIONS = {
  logger: true,
};

const build = async ({ options = DEFAULT_OPTIONS, plugins = [] } = {}) => {
  const app = fastify(options);

  plugins.forEach((plugin) => app.register(plugin));

  app.register(routes);

  return app;
};

export default build;
