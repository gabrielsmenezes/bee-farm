import { SeedType } from "./types";

export interface SeedConfig {
  type: SeedType;
  name: string;
  emoji: string;
  cost: number;
  harvestValue: number;
  growthDays: number;
  seedDropChance: number;
  description: string;
  color: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  /** If set, the shop only stocks this many per in-game month (28 days). Unlimited if undefined. */
  monthlyStock?: number;
}

export const SEED_REGISTRY: Record<SeedType, SeedConfig> = {
  [SeedType.WHEAT]: {
    type: SeedType.WHEAT,
    name: "Wheat",
    emoji: "🌾",
    cost: 1,
    harvestValue: 4,
    growthDays: 2,
    seedDropChance: 0.5,
    description: "Cheap and fast. The backbone of any farm.",
    color: "#f59e0b",
    rarity: "common",
    // unlimited
  },
  [SeedType.SUNFLOWER]: {
    type: SeedType.SUNFLOWER,
    name: "Sunflower",
    emoji: "🌻",
    cost: 3,
    harvestValue: 10,
    growthDays: 5,
    seedDropChance: 0.4,
    description: "Balanced yield. Great for mid-game economy.",
    color: "#eab308",
    rarity: "common",
    // unlimited
  },
  [SeedType.MUSHROOM]: {
    type: SeedType.MUSHROOM,
    name: "Mushroom",
    emoji: "🍄",
    cost: 5,
    harvestValue: 8,
    growthDays: 3,
    seedDropChance: 0.8,
    description: "High seed drop — nearly self-sustaining. Limited stock.",
    color: "#a16207",
    rarity: "uncommon",
    monthlyStock: 10,
  },
  [SeedType.BLUEBERRY]: {
    type: SeedType.BLUEBERRY,
    name: "Blueberry",
    emoji: "🫐",
    cost: 12,
    harvestValue: 30,
    growthDays: 10,
    seedDropChance: 0.25,
    description: "Slow but very profitable. Limited monthly supply.",
    color: "#6d28d9",
    rarity: "rare",
    monthlyStock: 5,
  },
  [SeedType.POISON_IVY]: {
    type: SeedType.POISON_IVY,
    name: "Poison Ivy",
    emoji: "☠️",
    cost: 1,
    harvestValue: 1,
    growthDays: 1,
    seedDropChance: 1.0,
    description: "Grows instantly, but wilts neighbors. Use with caution!",
    color: "#4d7c0f",
    rarity: "uncommon",
    // unlimited — it's a challenge seed
  },
  [SeedType.GOLDEN_SEED]: {
    type: SeedType.GOLDEN_SEED,
    name: "Golden Seed",
    emoji: "✨",
    cost: 80,
    harvestValue: 200,
    growthDays: 20,
    seedDropChance: 0.05,
    description: "Legendary luxury crop. Only 1 available per month.",
    color: "#fbbf24",
    rarity: "legendary",
    monthlyStock: 1,
  },
};
