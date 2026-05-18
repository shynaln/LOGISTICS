import { getDatabase, ref, update, onValue } from "firebase/database";
import { loadGPX } from "./utils/loadGPX";

const db = getDatabase();

let vehicles: any = {};
let paths: any = {};
let ready = false;

////////////////////////////////////////////////////////////////////////////////
// LISTEN VEHICLES
////////////////////////////////////////////////////////////////////////////////

onValue(ref(db, "vehicles"), (snap) => {
  vehicles = snap.val() || {};
});

////////////////////////////////////////////////////////////////////////////////
// ROUTES
////////////////////////////////////////////////////////////////////////////////

const ROUTES = ["R1", "R2", "R3"];

function distance(a: any, b: any) {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;

  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;

  const A =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) ** 2;

  const C = 2 * Math.atan2(Math.sqrt(A), Math.sqrt(1 - A));

  return R * C;
}

function getAngle(a: any, b: any) {
  if (!a || !b) return 0;
  const dy = b[0] - a[0];
  const dx = b[1] - a[1];
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

////////////////////////////////////////////////////////////////////////////////
// LOAD GPX
////////////////////////////////////////////////////////////////////////////////

(async () => {
  for (let key of ROUTES) {
    const data = await loadGPX(`/routes/${key}.gpx`);

    let cumulative: number[] = [0];
    let total = 0;

    for (let i = 0; i < data.length - 1; i++) {
      total += distance(data[i], data[i + 1]);
      cumulative.push(total);
    }

    paths[key] = {
      points: data,
      cumulative,
      total
    };
  }

  ready = true;
})();

////////////////////////////////////////////////////////////////////////////////
// ENGINE (CHỈ UPDATE STATE, KHÔNG ANIMATE)
////////////////////////////////////////////////////////////////////////////////

setInterval(() => {

  if (!ready) return;

  Object.keys(vehicles).forEach((key) => {
    const v = vehicles[key];
    const routeData = paths[key];

    if (!v?.running || !routeData) return;

    let percent = (v.percent || 0) + (v.speed || 0.05);

    percent = Math.min(100, percent);

    update(ref(db, "vehicles/" + key), {
      percent,
      speed: v.speed || 0.05
    });

  });

}, 200); // 🔥 giảm tần suất (mượt hơn rất nhiều)