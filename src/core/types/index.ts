export type Vector2 = {
  x: number;
  y: number;
};

export enum EntityType {
  PLAYER = "PLAYER",
  PLANT = "PLANT",
}

export enum TileType {
  GRASS = "GRASS",
  SOIL = "SOIL",
  WATERED_SOIL = "WATERED_SOIL",
  SHOP = "SHOP",
  LAND_OFFICE = "LAND_OFFICE",
  HARVESTER = "HARVESTER",
  AUTO_SEEDS = "AUTO_SEEDS",
  AUTO_PLOW = "AUTO_PLOW",
}

export enum PlantStage {
  SEED = "SEED",
  GROWING = "GROWING",
  MATURE = "MATURE",
  DEAD = "DEAD",
}

export type Grid = Tile[][];

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  entityId?: string | null;
  isFarmable: boolean;
}

export interface Inventory {
  seeds: number; // For now assuming 1 type of seed
  coins: number;
}

export interface GameState {
  grid: Grid;
  day: number;
  time: number; // 0-24? Or ticks? Let's say ticks for now.
  entities: Record<string, Entity>;
  inventory: Inventory;
  nextLandCost: number;
  tax: {
    amount: number;
    daysUntilDue: number;
  };
  isPaused: boolean;
  hasHarvester: boolean;
  hasAutoSeeds: boolean;
  hasAutoPlow: boolean;
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Vector2;
}

export enum GameEvent {
  STATE_CHANGED = "STATE_CHANGED",
  PLAYER_MOVED = "PLAYER_MOVED",
  TIME_TICK = "TIME_TICK",
  DAY_PASSED = "DAY_PASSED",
  TRANSACTION = "TRANSACTION", // Added for UI feedback?
}

export type GameAction =
  | { type: "MOVE_PLAYER"; direction: Vector2 }
  | { type: "INTERACT" } // Plant/Harvest
  | { type: "TOGGLE_PAUSE" }
  | { type: "SAVE_GAME" };
