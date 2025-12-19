import { createClient} from "redis";
import express from "express";

const redisClient = createClient();

redisClient.on("error", (error) => {
    console.error("Redis Client Error", error);
});





const app = express();

app.get("/", async (req, res) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `rate_limiter:${ip}`;

    const count = await redisClient.incr(key);

    if(count === 1){
        await redisClient.expire(key, 60); // Set TTL of 60 seconds
    }
    if(count > 3){
        throw new Error("Too many requests");
    }
});

app.listen(3000, async () => {
    try{
        await redisClient.connect();
    }
    catch(err){
        console.error("Redis Client Error", err);
    }
    console.log("Server is running on port 3000");
})