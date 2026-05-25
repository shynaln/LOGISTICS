import express from "express";
import fetch from "node-fetch";
import cors from "cors";

////////////////////////////////////////////////////////
// FIREBASE
////////////////////////////////////////////////////////

import { initializeApp } from "firebase/app";

import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child
} from "firebase/database";

////////////////////////////////////////////////////////
// FIREBASE CONFIG
////////////////////////////////////////////////////////

const firebaseConfig = {
  apiKey: "AIzaSyAmv_HUKIoqJYcjbLImJLofGptYTqGSDWg",
  authDomain: "dong-e8172.firebaseapp.com",
  databaseURL: "https://dong-e8172-default-rtdb.firebaseio.com",
  projectId: "dong-e8172",
  storageBucket: "dong-e8172.firebasestorage.app",
  messagingSenderId: "91910891639",
  appId: "1:91910891639:web:00e9fdb0f22d5185957e72"
};

const firebaseApp =
  initializeApp(firebaseConfig);

const db =
  getDatabase(firebaseApp);

////////////////////////////////////////////////////////
// EXPRESS
////////////////////////////////////////////////////////

const app = express();

////////////////////////////////////////////////////////
// CONFIG
////////////////////////////////////////////////////////

const TOKEN =
  "8794617271:AAEw3DOE6N3_ngpbdlFBoRHSYtykfjfW4sc";

const PORT = 3000;

////////////////////////////////////////////////////////
// MIDDLEWARE
////////////////////////////////////////////////////////

app.use(cors({
  origin: "*"
}));

app.use(express.json());

////////////////////////////////////////////////////////
// HEALTH CHECK
////////////////////////////////////////////////////////

app.get("/", (req, res) => {

  res.send(
    "🚀 Telegram Server OK"
  );

});

////////////////////////////////////////////////////////
// SEND TELEGRAM MESSAGE
////////////////////////////////////////////////////////

app.post(
  "/send-telegram",

  async (req, res) => {

    const {
      chatId,
      text
    } = req.body;

    console.log(
      "📤 SEND:",
      chatId,
      text
    );

    if (!chatId || !text) {

      return res.json({

        ok: false,

        error:
          "Missing chatId or text"
      });
    }

    try {

      ////////////////////////////////////////////////////
      // SEND TO TELEGRAM
      ////////////////////////////////////////////////////

      const r = await fetch(

        `https://api.telegram.org/bot${TOKEN}/sendMessage`,

        {

          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            chat_id:
              chatId,

            text
          })
        }
      );

      const data =
        await r.json();

      console.log(
        "✅ SENT:",
        data
      );

      ////////////////////////////////////////////////////
      // SAVE CHAT HISTORY
      ////////////////////////////////////////////////////

      const newRef = push(
        ref(db, "telegramMessages")
      );

      const messageData = {

  type: "driver",

  sender:
    String(chatId),

  receiver:
    "control_center",

  chatId:
    String(chatId),

  text:
    text || "",

  time:
    Date.now()
};

//////////////////////////////////////////////////
// OPTIONAL USERNAME
//////////////////////////////////////////////////

if (username) {

  messageData.username =
    username;
}

//////////////////////////////////////////////////
// SAVE
//////////////////////////////////////////////////

await set(
  newRef,
  messageData
);

      ////////////////////////////////////////////////////
      // RESPONSE
      ////////////////////////////////////////////////////

      res.json({

        ok: true,

        message:
          "Message sent",

        data
      });

    } catch (err) {

      console.error(
        "❌ SEND ERROR:",
        err
      );

      res.json({
        ok: false
      });
    }
  }
);

////////////////////////////////////////////////////////
// GET CHAT HISTORY
////////////////////////////////////////////////////////

app.get(
  "/chat-history/:chatId",

  async (req, res) => {

    try {

      const chatId =
        req.params.chatId;

      const snapshot =
        await get(
          ref(
            db,
            "telegramMessages"
          )
        );

      if (!snapshot.exists()) {

        return res.json([]);
      }

      const data =
        snapshot.val();

      const messages =
        Object.values(data)
          .filter(
            item =>
              String(item.chatId)
              === String(chatId)
          )
          .sort(
            (a, b) =>
              a.time - b.time
          );

      res.json(messages);

    } catch (err) {

      console.log(err);

      res.json([]);
    }
  }
);

////////////////////////////////////////////////////////
// GET ALL DRIVER LIST
////////////////////////////////////////////////////////

app.get(
  "/drivers",

  async (req, res) => {

    try {

      const snapshot =
        await get(
          ref(
            db,
            "telegramMessages"
          )
        );

      if (!snapshot.exists()) {

        return res.json([]);
      }

      const data =
        snapshot.val();

      const uniqueDrivers =
        {};

      Object.values(data)
        .forEach(item => {

          if (
            item.chatId
          ) {

            uniqueDrivers[
              item.chatId
            ] = {

              chatId:
                item.chatId,

              username:
                item.username ||
                "Unknown"
            };
          }
        });

      res.json(
        Object.values(
          uniqueDrivers
        )
      );

    } catch (err) {

      res.json([]);
    }
  }
);

////////////////////////////////////////////////////////
// RECEIVE TELEGRAM
////////////////////////////////////////////////////////

let lastUpdateId = 0;

setInterval(async () => {

  try {

    const r = await fetch(

      `https://api.telegram.org/bot${TOKEN}/getUpdates?offset=${lastUpdateId + 1}`

    );

    const data =
      await r.json();

    if (!data.result)
      return;

    for (const update of data.result) {

      lastUpdateId =
        update.update_id;

      const text =
        update.message?.text;

      const chatId =
        update.message?.chat?.id;

      const username =
        update.message?.from
          ?.username || "";

      if (!chatId)
        continue;

      console.log(
        "📩 NEW MESSAGE"
      );

      console.log(
        "👤 chatId:",
        chatId
      );

      console.log(
        "💬 text:",
        text
      );

      ////////////////////////////////////////////////////
      // SAVE CHAT HISTORY
      ////////////////////////////////////////////////////

      const newRef = push(
        ref(db, "telegramMessages")
      );

      await set(newRef, {

        type: "driver",

        sender:
          username ||
          "driver",

        receiver:
          "control_center",

        username,

        chatId,

        text,

        time:
          Date.now()
      });

      ////////////////////////////////////////////////////
      // /start
      ////////////////////////////////////////////////////

      if (text === "/start") {

        await sendTelegramMessage(

          chatId,

`✅ Bot connected

📌 Your Chat ID:
${chatId}

📋 Commands:
/arrived
/emergency
/help`
        );
      }

      ////////////////////////////////////////////////////
      // /help
      ////////////////////////////////////////////////////

      if (text === "/help") {

        await sendTelegramMessage(

          chatId,

`📋 Available Commands

/arrived
Xe đã tới nơi

/emergency
Gửi tín hiệu khẩn cấp

/help
Hiển thị trợ giúp`
        );
      }

      ////////////////////////////////////////////////////
      // /arrived
      ////////////////////////////////////////////////////

      if (text === "/arrived") {

        console.log(
          "🚚 Xe đã đến nơi!"
        );

        const arrivedRef =
          push(
            ref(
              db,
              "arrivedEvents"
            )
          );

        await set(arrivedRef, {

          chatId,

          username,

          time:
            Date.now()
        });

        await sendTelegramMessage(

          chatId,

          "✅ Đã ghi nhận xe tới nơi"
        );
      }

      ////////////////////////////////////////////////////
      // /emergency
      ////////////////////////////////////////////////////

      if (text === "/emergency") {

        console.log(
          "🚨 EMERGENCY"
        );

        const emergencyRef =
          push(
            ref(
              db,
              "emergencyEvents"
            )
          );

        await set(emergencyRef, {

          chatId,

          username,

          time:
            Date.now()
        });

        await sendTelegramMessage(

          chatId,

          "🚨 Đã gửi tín hiệu khẩn cấp tới trung tâm"
        );
      }

    }

  } catch (err) {

    console.log(
      "❌ getUpdates error"
    );

    console.log(err);

  }

}, 3000);

////////////////////////////////////////////////////////
// SEND TELEGRAM FUNCTION
////////////////////////////////////////////////////////

async function sendTelegramMessage(
  chatId,
  text
) {

  try {

    await fetch(

      `https://api.telegram.org/bot${TOKEN}/sendMessage`,

      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          chat_id:
            chatId,

          text
        })
      }
    );

  } catch (err) {

    console.log(
      "❌ sendTelegramMessage error"
    );

  }
}

////////////////////////////////////////////////////////
// REALTIME TEST API
////////////////////////////////////////////////////////

app.get(
  "/latest-messages",

  async (req, res) => {

    try {

      const snapshot =
        await get(
          ref(
            db,
            "telegramMessages"
          )
        );

      if (!snapshot.exists()) {

        return res.json([]);
      }

      const data =
        snapshot.val();

      const messages =
        Object.values(data)
          .sort(
            (a, b) =>
              b.time - a.time
          )
          .slice(0, 50);

      res.json(messages);

    } catch (err) {

      res.json([]);
    }
  }
);

////////////////////////////////////////////////////////
// START SERVER
////////////////////////////////////////////////////////

app.listen(PORT, () => {

  console.log(
`🔥 Server running at http://localhost:${PORT}`
  );

});