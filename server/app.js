const express = require("express");
const app = express()
const sequelize = require("./config/database")
const userRoute = require("./apis/routes/user.route")
const chatRoute = require("./apis/routes/chat.route")
const defineAssociation = require("./apis/Associations/associations")
const cors = require("cors");
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { google } = require("googleapis");
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
});

const socketHandler = require("./socket/socket");

socketHandler(io);

app.use((req, res, next) => {
    req.io = io;
    next();
});

const corsOpts = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOpts));


app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }), // keeps raw body as Buffer
    (req, res) => {
        const secret = process.env.WEBHOOK_SECRET;
        const signature = req.headers["x-razorpay-signature"];

        try {
            // req.body is a Buffer
            const shasum = crypto.createHmac("sha256", secret);
            shasum.update(req.body);
            const expectedSign = shasum.digest("hex");

            if (expectedSign === signature) {
                const data = JSON.parse(req.body.toString());
                console.log("Webhook verified:", data);
                res.status(200).send("ok");
            } else {
                console.log("Invalid signature");
                res.status(400).send("invalid signature");
            }
        } catch (err) {
            console.error("Webhook error:", err);
            res.status(500).send("server error");
        }
    }
);

app.use(express.json())
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute)
app.use("/api/conversations", require("./apis/routes/conversation.routes"))
app.use("/api/messages", require("./apis/routes/message.route"))

defineAssociation()

app.get("/", (req, res) => {
    res.send("Hello Server");
})


const razorpay = new Razorpay({
    key_id: process.env.RZP_KEY_ID,
    key_secret: process.env.RZP_KEY_SECRET
});

// create order
app.post('/api/create-order', async (req, res) => {
    try {
        const amountInRupees = req.body.amount || 1;
        const options = {
            amount: amountInRupees * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



// verify payment signtaure
app.post('/api/verify-payment', (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RZP_KEY_SECRET)
        .update(sign.toString())
        .digest("hex");

    if (razorpay_signature === expectedSign) {
        res.json({ status: "success" });
    } else {
        res.status(400).json({ status: "failure" });
    }
});






async function getAccessToken() {

    const privateKey = process.env.private_key.replace(/\\n/gm, "\n");

    const jwtClient = new google.auth.JWT({
        email: process.env.client_email,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const tokens = await jwtClient.authorize();
    console.log("Access Token:", tokens.access_token);
}

getAccessToken().catch((err) => {
    console.error("Error generating token:", err);
});

sequelize.sync().then(() => {
    console.log("database connected")
}).catch((err) => {
    console.log(err)
})

server.listen(3000, () => {
    console.log("server is running at http://localhost:3000")
})



















