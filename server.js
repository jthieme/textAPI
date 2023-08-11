const express = require("express");
const bodyParser = require("body-parser");
const Redis = require("redis");
const app = express();
const port = 30260;

const redisClient = Redis.createClient({url:"rediss://default:62b621ee499146d785273842cad2590f@usw2-on-cat-30260.upstash.io:30260"});

app.use(bodyParser.json());

app.listen(port, async () => {
    const redisConnect = redisClient.connect();

    redisConnect;

    // ternary expression to log if we are connected or not
    redisConnect ? 
        console.log(`You're connected to Redis!\nListening on port ${port}`)
    :   console.log("Sorry, you're not connected to Redis")
});

app.get('/', (req, res) => {
    res.send("Node Server is here");
});

/***********************************
 * ALL OF THE SENDS
***********************************/
app.post('/sendWard', async (req, res) => {
    const body = req.body;
    const message = req.message;
    const accountSid = body.accountSid;
    const authToken = body.authToken;
    const client = require("twilio")(accountSid, authToken)

    const phoneNumbers = await redisClient.hVals("wardList");

    if (phoneNumbers != null) {
        phoneNumbers.map((number) => {
            client.messages.create({
                body: message,
                from: ''
            })
        });
        res.status(200);
        res.send(`${JSON.stringify(phoneNumbers)}`);
    } else {
        res.status(401);
        res.send("Empty phone list");
    }
});

app.post('/sendTest', async (req, res) => {
    const body = req.body;
    const message = req.message;
    const accountSid = body.accountSid;
    const authToken = body.authToken;
    const twilioNumber = body.twilioNumber;
    const client = require("twilio")(accountSid, authToken)

    const phoneNumbers = await redisClient.hVals("test");

    if (phoneNumbers != null) {
        phoneNumbers.map((number) => {
            client.messages.create({
                body: message,
                from: twilioNumber,
                to: number
            }).then(message => console.log(`Message sent to number: ${number} with message id: ${message.sid}`));
        });
        res.status(200);
        res.send("Text has been sent.");
    } else {
        res.status(401);
        res.send("Empty phone list");
    }
});

/***********************************
 * ALL OF THE GETS
***********************************/

app.get('/getWard', async (req, res) => {
    const phoneNumbers = await redisClient.hVals("wardList");

    if (phoneNumbers != null) {
        res.status(200);
        res.send(`${JSON.stringify(phoneNumbers)}`);
    } else {
        res.status(401);
        res.send("Empty phone list");
    }
});

app.get('/getEQ', async (req, res) => {
    const phoneNumbers = await redisClient.hVals("eqList");

    if (phoneNumbers != null) {
        res.status(200);
        res.send(`${JSON.stringify(phoneNumbers)}`);
    } else {
        res.status(400);
        res.send("Empty phone list");
    }
});

app.get('/getRS', async (req, res) => {
    const phoneNumbers = await redisClient.hVals("rsList");

    if (phoneNumbers != null) {
        res.status(200);
        res.send(`${JSON.stringify(phoneNumbers)}`);
    } else {
        res.status(400);
        res.send("Empty phone list");
    }
});

/***********************************
 * ALL OF THE ADDS
***********************************/

app.post('/addUser', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const verifiedUsers = "verifiedUsers";

    const userExists = await redisClient.hExists(verifiedUsers, userName);
        
    if (!userExists) {
        await redisClient.hSet(verifiedUsers, userName, phone);
        res.status(200);
        res.send(`Verified User ${userName} has been added!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is already a Verified User.`);
    }
});

app.post('/addWardMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const wardList = "wardList";

    const userExists = await redisClient.hExists(wardList, userName);
        
    if (!userExists) {
        await redisClient.hSet(wardList, userName, phone);
        res.status(200);
        res.send(`EQ Member ${userName} has been added!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is already in the database.`);
    }
});

app.post('/addEQMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const eqList = "eqList";

    const userExists = await redisClient.hExists(eqList, userName);
        
    if (!userExists) {
        await redisClient.hSet(eqList, userName, phone);
        res.status(200);
        res.send(`EQ Member ${userName} has been added!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is already in the database.`);
    }
});

app.post('/addRSMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const rsList = "rsList";

    const userExists = await redisClient.hExists(rsList, userName);
        
    if (!userExists) {
        await redisClient.hSet(rsList, userName, phone);
        res.status(200);
        res.send(`RS Member ${userName} has been added!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is already in the database.`);
    }
});

/***********************************
 * ALL OF THE REMOVES
***********************************/

app.post('/removeUser', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const verifiedUsers = "verifiedUsers";

    const userExists = await redisClient.hExists(verifiedUsers, userName);
        
    if (userExists) {
        await redisClient.hDel(verifiedUsers, userName);
        res.status(200);
        res.send(`Verified User ${userName} has been removed!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is not a Verified User.`);
    }
});

app.post('/removeWardMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const wardList = "wardList";

    const userExists = await redisClient.hExists(wardList, userName);
        
    if (userExists) {
        await redisClient.hDel(wardList, userName);
        res.status(200);
        res.send(`EQ Member ${userName} has been removed!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is not in the database.`);
    }
});

app.post('/removeEQMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const eqList = "eqList";

    const userExists = await redisClient.hExists(eqList, userName);
        
    if (userExists) {
        await redisClient.hDel(eqList, userName);
        res.status(200);
        res.send(`EQ Member ${userName} has been removed!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is not in the database.`);
    }
});

app.post('/removeRSMember', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const rsList = "rsList";

    const userExists = await redisClient.hExists(rsList, userName);

    if (userExists) {
        await redisClient.hDel(rsList, userName);
        res.status(200);
        res.send(`RS Member ${userName} has been removed!`);
    } else {
        res.status(400);
        res.send(`ERROR: ${userName} with phone number ${phone} is not in the database.`);
    }
});

app.post('/addWardList', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const wardList = "wardList";

    body.data.map((i) => {
        redisClient.hSet(wardList, i.name, i.phone);
    });

    const list = await redisClient.hGetAll(wardList)
    if (list) {
        res.status(200);
        res.send("Success");
    } else {
        res.status(400);
        res.send("Failed");
    }

    // const test = await redisClient.hGetAll(wardList);
    // console.log(body.data.map((i) => redisClient.hSet(wardList, i.name, i.phone)));
});

app.post('/addEQList', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const eqList = "eqList";

    // body.eq.map((i) => {
    //     redisClient.hSet(eqList, i.name, i.phone);
    // });

    // const list = await redisClient.hGetAll(eqList)
    // if (list) {
    //     res.status(200);
    //     res.send("Success");
    // } else {
    //     res.status(400);
    //     res.send("Failed");
    // }

    console.log(body.data.map((i) => redisClient.hSet(eqList, i.name, i.phone)));
});

app.post('/addRSList', async (req, res) => {
    const body = req.body;
    const userName = body.name;
    const phone = body.phone;

    const rsList = "rsList";

    // body.rs.map((i) => {
    //     redisClient.hSet(rsList, i.name, i.phone);
    // });

    // const list = await redisClient.hGetAll(rsList)
    // if (list) {
    //     res.status(200);
    //     res.send("Success");
    // } else {
    //     res.status(400);
    //     res.send("Failed");
    // }

    console.log(body.data.map((i) => redisClient.hSet(rsList, i.name, i.phone)));
});