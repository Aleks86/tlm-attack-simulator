import { UnitProperty, UnitType } from "@/units";
import _jsonData from "./unitsData.json";

export type UnitDataJson = {
  maxLevel: number;
  build: {
    resourcesNeeded: [number, number, number, number][];
    population: number[];
    timeSec: number[];
    properties: Record<UnitProperty, { base: number; increase: number }>;
  };
  upgrade: {
    resourcesNeeded: [number, number, number, number][];
    workers: number[];
    timeSec: number[];
    // buildingsNeeded: BuildingsRequirementsPerLevel[];
  };
};

export type UnitsDataJson = Record<UnitType, UnitDataJson>;

export const unitsData = _jsonData as unknown as UnitsDataJson;
