const Service = require("node-windows").Service;
const svc = new Service({
  name: "bzBond-server",
  description: "bzBond-server microservice for FileMaker Server",
  script: "C:\\Program Files\\bzBond-server\\server.js"
});

svc.on("install", function() {
  svc.start();
})

svc.install();