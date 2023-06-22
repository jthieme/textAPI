const express = require("express");
const bodyParser = require("body-parser");
const Redis = require("redis");
const app = express();
const port = 3000;

const redisClient = Redis.createClient({url:"redis://127.0.0.1:6379"});
const redisConnect = redisClient.connect();

app.use(bodyParser.json());

app.listen(port, () => {
    redisConnect;

    // ternary expression to log if we are connected or not
    redisConnect ? 
        console.log(`You're connected to Redis!\nListening on port ${port}`)
    :   console.log("Sorry, you're not connected to Redis")
});

app.get('/', (req, res) => {
    res.send("Node Server is here");
});

app.post('/add', async (req, res) => {
    const loginBody = req.body;
    const userName = loginBody.userName;
    const password = loginBody.password;

    const redisPassword = password === null ? null : await redisClient.hGet("verifiedUsers", userName);
    
    console.log(`password for ${userName}: ${redisPassword}`);

    if (loginBody != "") {
        res.send(`Welcome, ${userName}!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});