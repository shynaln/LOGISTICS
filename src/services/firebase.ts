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
// CONFIG
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

const app = initializeApp(firebaseConfig);

export const db =
  getDatabase(app);

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
};

//////////////////////////////////////////////////////
// 🔥 LISTEN VEHICLES
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
// 🔥 LISTEN SENSOR
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

export function addDriver(driver:any){

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
// 🔥 ASSIGN ROUTE
//////////////////////////////////////////////////////

export async function assignRoute(

  phone:string,

  route:string,

  driver:string,

  truck:string

){

  ////////////////////////////////////////////////////
  // ASSIGN
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
  // VEHICLE RUNNING
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
// 🔥 STOP VEHICLE
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
// LISTEN VEHICLES
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// LISTEN REALTIME GPS
//////////////////////////////////////////////////////

export function listenVehicles(

  cb:(data:any)=>void

){

  onValue(

    ref(db,"data"),

    (snap)=>{

      const data = snap.val();

      if(!data){

        cb([]);
        return;
      }

      cb([
        {
          id:"Truck-01",

          lat:Number(data.lat),

          lng:Number(data.lon),

          running:1
        }
      ]);
    }
  );
}

//////////////////////////////////////////////////////
// CHAT
//////////////////////////////////////////////////////

export function sendMessage(

  phone:string,

  message:string

){

  return push(

    ref(
      db,
      `messages/${phone}`
    ),

    {

      message,

      time:Date.now()
    }
  );
}

//////////////////////////////////////////////////////
// LISTEN CHAT
//////////////////////////////////////////////////////

export function listenMessages(

  phone:string,

  cb:(msgs:any[])=>void

){

  onValue(

    ref(
      db,
      `messages/${phone}`
    ),

    (snap)=>{

      cb(

        Object.values(
          snap.val() || {}
        )
      );
    }
  );
}