import { initializeApp } from "firebase/app";

import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  remove,
  update
} from "firebase/database";

//////////////////////////////////////////////////////
// FIREBASE CONFIG
//////////////////////////////////////////////////////

const firebaseConfig = {

  apiKey:
    "AIzaSyAmv_HUKIoqJYcjbLImJLofGptYTqGSDWg",

  authDomain:
    "dong-e8172.firebaseapp.com",

  databaseURL:
    "https://dong-e8172-default-rtdb.firebaseio.com",

  projectId:
    "dong-e8172",

  storageBucket:
    "dong-e8172.firebasestorage.app",

  messagingSenderId:
    "91910891639",

  appId:
    "1:91910891639:web:00e9fdb0f22d5185957e72"
};

//////////////////////////////////////////////////////
// INIT
//////////////////////////////////////////////////////

const app =
  initializeApp(firebaseConfig);

export const db =
  getDatabase(app);

console.log(
  "🔥 Firebase Connected"
);

//////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////

export type Truck = {

  running:number;

  driver?:string;

  speed?:number;

  load?:number;
};

export type TruckMap = {

  [id:string]: Truck;
};

export type SensorData = {

  temperature:number;

  humidity:number;

  gas:number;

  gas_status:string;

  lat?:number;

  lon?:number;
};

//////////////////////////////////////////////////////
// VEHICLES
//////////////////////////////////////////////////////

export function listenTrucks(

  cb:(data:TruckMap)=>void

){

  onValue(

    ref(db,"vehicles"),

    (snap)=>{

      cb(
        snap.val() || {}
      );
    }
  );
}

//////////////////////////////////////////////////////
// SENSOR
//////////////////////////////////////////////////////

export function listenSensors(

  cb:(data:SensorData)=>void

){

  onValue(

    ref(db,"data"),

    (snap)=>{

      cb(
        snap.val() || {}
      );
    }
  );
}

//////////////////////////////////////////////////////
// DRIVERS
//////////////////////////////////////////////////////

export function listenDrivers(

  cb:(data:any)=>void

){

  onValue(

    ref(db,"drivers"),

    (snap)=>{

      cb(
        snap.val() || {}
      );
    }
  );
}

//////////////////////////////////////////////////////
// ADD DRIVER
//////////////////////////////////////////////////////

export function addDriver(

  driver:any

){

  return set(

    ref(
      db,
      `drivers/${driver.phone}`
    ),

    {

      ...driver,

      status:"offline",

      route:"",

      created:Date.now()
    }
  );
}

//////////////////////////////////////////////////////
// UPDATE DRIVER
//////////////////////////////////////////////////////

export function updateDriver(

  phone:string,

  data:any

){

  return update(

    ref(
      db,
      `drivers/${phone}`
    ),

    data
  );
}

//////////////////////////////////////////////////////
// DELETE DRIVER
//////////////////////////////////////////////////////

export function deleteDriver(

  phone:string

){

  return remove(

    ref(
      db,
      `drivers/${phone}`
    )
  );
}

//////////////////////////////////////////////////////
// ASSIGN ROUTE
//////////////////////////////////////////////////////

export async function assignRoute(

  phone:string,

  route:string,

  driver:string,

  truck:string

){

  ////////////////////////////////////////////////////
  // ASSIGNMENT
  ////////////////////////////////////////////////////

  await set(

    ref(
      db,
      `assignments/${phone}`
    ),

    {

      route,

      time:Date.now()
    }
  );

  ////////////////////////////////////////////////////
  // VEHICLE
  ////////////////////////////////////////////////////

  await set(

    ref(
      db,
      `vehicles/${truck}`
    ),

    {

      running:1,

      route,

      driver,

      updated:Date.now()
    }
  );

  ////////////////////////////////////////////////////
  // DRIVER
  ////////////////////////////////////////////////////

  await update(

    ref(
      db,
      `drivers/${phone}`
    ),

    {

      route,

      status:"online"
    }
  );
}

//////////////////////////////////////////////////////
// STOP VEHICLE
//////////////////////////////////////////////////////

export async function stopVehicle(

  truck:string

){

  await update(

    ref(
      db,
      `vehicles/${truck}`
    ),

    {

      running:0,

      updated:Date.now()
    }
  );
}

//////////////////////////////////////////////////////
// REALTIME GPS
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// VEHICLES REALTIME
//////////////////////////////////////////////////////

export function listenVehicles(

  cb:(data:any)=>void

){

  onValue(

    ref(db,"vehicles"),

    (snap)=>{

      const data =
        snap.val() || {};

      cb(data);
    }
  );
}

//////////////////////////////////////////////////////
// TELEGRAM CHAT
//////////////////////////////////////////////////////

export function listenTelegramMessages(

  cb:(msgs:any[])=>void

){

  onValue(

    ref(
      db,
      "telegramMessages"
    ),

    (snap)=>{

      if(!snap.exists()){

        cb([]);

        return;
      }

      const data =
        snap.val();

      const arr =
        Object.values(data);

      arr.sort(

        (a:any,b:any)=>

          a.time - b.time
      );

      cb(arr);
    }
  );
}

//////////////////////////////////////////////////////
// SEND TELEGRAM MESSAGE
//////////////////////////////////////////////////////

export async function sendTelegramMessage(

  chatId:string,

  text:string

){

  await fetch(

    "http://localhost:3000/send-telegram",

    {

      method:"POST",

      headers:{

        "Content-Type":
          "application/json"
      },

      body: JSON.stringify({

        chatId,

        text
      })
    }
  );
}