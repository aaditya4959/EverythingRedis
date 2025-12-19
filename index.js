// import express from "express";
// import { createClient} from "redis"


// const app = express();

// const redisClient = createClient();

// redisClient.on("error", (error) => {
//     console.error("Redis Client Error", error);
// });

// await redisClient.connect();

// app.get("/", async (req, res) => {
//     let visits = await redisClient.get("visits");
//     if (!visits) {
//         visits = 0;
//     }
//     visits = parseInt(visits) + 1;
//     await redisClient.set("visits", visits);
//     res.send(`Number of visits: ${visits}`);
// }); 



// app.listen(3000, () => {
//     console.log("Server is running on port 3000");
// })



import { createClient } from "redis";
import express from "express";

const app = express();

const redisClient = createClient();

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

await redisClient.connect(); // ✅ connect BEFORE using redis

app.get("/", async (req, res) => {
  try {
    const ip =
      req.ip ||
      req.socket.remoteAddress ||
      "unknown";

    const key = `rate_limiter:${ip}`;

    const count = await redisClient.incr(key);

    if (count === 1) {
      await redisClient.expire(key, 60);
    }

    if (count > 3) {
      return res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
    }

    return res.json({
      message: "Request successful",
      requests: count,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server is running on port 3000");
});
