const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN";

app.post("/send-telegram", async (req, res) => {
  const { chatId, text } = req.body;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  res.send({ ok: true });
});

app.listen(3000, () => console.log("Server running"));