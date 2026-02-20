import { PropertyType } from "./types";

export type BuffType = "VALUE" | "GROWTH_SPEED" | "SEED_DROP";

export interface PropertyConfig {
  type: PropertyType;
  name: string;
  emoji: string;
  cost: number;
  buffType: BuffType;
  buffMultiplier: number; 
  radius: number;         
  description: string;
  color: string;
}

export const PROPERTY_REGISTRY: Record<PropertyType, PropertyConfig> = {
  [PropertyType.GREENHOUSE]: {
    type: PropertyType.GREENHOUSE,
    name: "Greenhouse",
    emoji: "🏡",
    cost: 200,
    buffType: "VALUE",
    buffMultiplier: 1.5,
    radius: 1,
    description: "+50% harvest value for adjacent plants.",
    color: "#22c55e",
  },
  [PropertyType.WATER_TOWER]: {
    type: PropertyType.WATER_TOWER,
    name: "Water Tower",
    emoji: "💧",
    cost: 150,
    buffType: "GROWTH_SPEED",
    buffMultiplier: 0.7,
    radius: 2,
    description: "-30% growth time for plants within 2 tiles.",
    color: "#38bdf8",
  },
  [PropertyType.BEEHIVE]: {
    type: PropertyType.BEEHIVE,
    name: "Beehive",
    emoji: "🐝",
    cost: 300,
    buffType: "SEED_DROP",
    buffMultiplier: 1.5,
    radius: 1,
    description: "+50% seed drop chance for adjacent plants.",
    color: "#fbbf24",
  },
};
