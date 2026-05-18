export interface Truck {
  lat: number;
  lon: number;
  speed: number;
  gas: number;
  name?: string;
}

export interface TruckMap {
  [key: string]: Truck;
}