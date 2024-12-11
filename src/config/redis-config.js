import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const client = createClient({ url: REDIS_URL });

async function redisConnect() {
  client.on("error", (err) => console.log("Redis Client Error", err));
  await client.connect();
  console.log("Redis connected successfully");
}

export { redisConnect, client };