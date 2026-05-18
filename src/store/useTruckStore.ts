import { create } from "zustand";
import type { TruckMap } from "../types/truck";

interface State {
  trucks: TruckMap;
  setTrucks: (t: TruckMap) => void;
}

export const useTruckStore = create<State>((set) => ({
  trucks: {},
  setTrucks: (t) => set({ trucks: t }),
}));