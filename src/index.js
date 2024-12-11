import express from "express";
import { rabbitmqConnect } from "./config/rabbitmq-config.js";
import { redisConnect } from "./config/redis-config.js";
import { PORT } from "./config/server-config.js";
import v1route from "./routes/index.js";

const server = express();

server.use(express.json());
server.use("/api", v1route);

const startAndcreateServer = async () => {
  try {
    await rabbitmqConnect();
    await redisConnect();

    server.listen(PORT, () => {
      console.log(`Server started at port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startAndcreateServer();