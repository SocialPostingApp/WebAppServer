import initApp from "./app";
import https from "https";
import http, { Server } from "http";
import fs from "fs";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

initApp().then((app) => {
  let port: string = '3000';

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Web Advanced Application development 2023 REST API",
        version: "1.0.1",
        description:
          "REST server",
      },
      servers: [
        {
          url:  "http://localhost:" + port
        },
      ],
    },
    apis: ["./src/routes/*.ts"],
  };

  const specs = swaggerJsDoc(options);
  app.use("/api", swaggerUI.serve, swaggerUI.setup(specs));
  app.use("*", (_, res) => {
    res.sendFile("client/index.html", { root: "public" });
  });

  let server: Server;
  server = http.createServer(app);

  server = server
    .listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    })
    .on("error", (err) => {
      console.error("Error creating HTTPS server:", err.message);
    });
});