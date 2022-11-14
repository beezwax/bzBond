import Fastify from "fastify";
import routes from "./routes.js";
import plugins from "./plugins.js";

// Run the server!
const start = async () => {
  const fastify = Fastify({
    logger: true,
  });

  const installedPlugins = await plugins();
  installedPlugins.forEach((plugin) => fastify.register(plugin.default));

  fastify.register(routes);

  try {
    await fastify.listen(8999);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
