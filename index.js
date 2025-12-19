import express from "express";
import { createClient} from "redis"


const app = express();

const redisClient = createClient();

redisClient.on("error", (error) => {
    console.error("Redis Client Error", error);
});

await redisClient.connect();

app.get("/", async (req, res) => {
    let visits = await redisClient.get("visits");
    if (!visits) {
        visits = 0;
    }
    visits = parseInt(visits) + 1;
    await redisClient.set("visits", visits);
    res.send(`Number of visits: ${visits}`);
}); 



app.listen(3000, () => {
    console.log("Server is running on port 3000");
})