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
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const redisPhone = phone === null ? null : await redisClient.hSet("verifiedUsers", userName, phone);
    
    console.log(`password for ${userName}: ${redisPhone}`);

    if (body != null) {
        res.send(`Welcome, ${userName}!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});

app.post('/get', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const redisPhone = phone === null ? null : await redisClient.hGet("verifiedUsers", userName);
    
    console.log(`password for ${userName}: ${redisPhone}`);

    if (body != null) {
        res.send(`Welcome, ${userName}!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});

app.post('/remove', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const redisPhone = phone === null ? null : await redisClient.hDel("verifiedUsers", userName);
    
    console.log(`password for ${userName}: ${redisPhone}`);

    if (body != null) {
        res.send(`${userName} has been removed!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});

app.post('/addWardMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const redisPhone = phone === null ? null : await redisClient.hSet("wardList", userName, phone);
    
    console.log(`password for ${userName}: ${redisPhone}`);

    if (body != null) {
        res.send(`${userName} has been added!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});

app.post('/removeWardMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const redisPhone = phone === null ? null : await redisClient.hDel("wardList", userName);
    
    console.log(`password for ${userName}: ${redisPhone}`);

    if (body != null) {
        res.send(`Ward Member ${userName} has been removed!`);
    } else {
        res.status(401);
        res.send("Empty message.");
    }
});