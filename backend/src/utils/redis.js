import { createClient } from "redis";

const connectToRedis = async () => {
  try {
    const client = createClient({
      username: "default",
      password: "b0pmRpnh3WXf5lThdAuJNl0QqGpObjK4",
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    console.log("Connecting to Redis...");
    await client.connect();
    console.log("Redis Connected Successfully");
    await client.set(
      "CONNECTION_STRING",
      "REDIS CONNECTION STATUS:OK",
      "EX",
      60
    );
    const result = await client.get("CONNECTION_STRING");
    console.log(result);
    return client;
  } catch (error) {
    console.log(`Redis connection error: ${error}`);
    process.exit(1);
  }
};

export default connectToRedis;
