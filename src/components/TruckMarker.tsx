import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Truck } from "../types/truck";

const truckIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/743/743131.png",
  iconSize: [32, 32],
});

export default function TruckMarker({ truck }: { truck: Truck }) {
  return (
    <Marker position={[truck.lat, truck.lon]} icon={truckIcon}>
      <Popup>
        🚚 {truck.name || "Truck"} <br />
        Speed: {truck.speed} km/h <br />
        {truck.gas > 300 && "🔥 GAS ALERT"}
      </Popup>
    </Marker>
  );
}