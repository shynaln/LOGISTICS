import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////
const TOKEN = "8794617271:AAEw3DOE6N3_ngpbdlFBoRHSYtykfjfW4sc"; // ⚠️ nên thay token mới
const PORT = 3000;

////////////////////////////////////////////////////////
// MIDDLEWARE
////////////////////////////////////////////////////////
app.use(cors({ origin: "*" }));
app.use(express.json());

////////////////////////////////////////////////////////
// HEALTH CHECK
////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.send("🚀 Telegram Server OK");
});

////////////////////////////////////////////////////////
// SEND TELEGRAM
////////////////////////////////////////////////////////
app.post("/send-telegram", async (req, res) => {
  const { chatId, text } = req.body;

  console.log("📤 SEND:", chatId, text);

  if (!chatId || !text) {
    return res.json({
      ok: false,
      error: "Missing chatId or text"
    });
  }

  try {
    const r = await fetch(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text
        })
      }
    );

    const data = await r.json();

    console.log("✅ SENT:", data);

    res.json(data);

  } catch (err) {
    console.error("❌ SEND ERROR:", err);
    res.json({ ok: false });
  }
});

////////////////////////////////////////////////////////
// RECEIVE TELEGRAM (GET UPDATES)
////////////////////////////////////////////////////////
let lastUpdateId = 0;

setInterval(async () => {
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}`
    );

    const data = await r.json();

    data.result.forEach(update => {
      lastUpdateId = update.update_id;

      const text = update.message?.text;
      const chatId = update.message?.chat?.id;

      console.log("📩 MESSAGE FROM DRIVER:");
      console.log("👤 chatId:", chatId);
      console.log("💬 text:", text);
      console.log("---------------------------");

      ////////////////////////////////////////////////////
      // 👉 XỬ LÝ LỆNH (OPTIONAL)
      ////////////////////////////////////////////////////
      if (text === "/start") {
        console.log("Driver started bot");
      }

      if (text === "/arrived") {
        console.log("🚚 Xe đã đến nơi!");
      }
    });

  } catch (err) {
    console.log("❌ getUpdates error");
  }
}, 3000);

////////////////////////////////////////////////////////
// START SERVER
////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});