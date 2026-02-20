export type Vector2 = {
  x: number;
  y: number;
};

export enum EntityType {
  PLAYER = "PLAYER",
  PLANT = "PLANT",
}

export enum SeedType {
  WHEAT = "WHEAT",
  SUNFLOWER = "SUNFLOWER",
  MUSHROOM = "MUSHROOM",
  BLUEBERRY = "BLUEBERRY",
  POISON_IVY = "POISON_IVY",
  GOLDEN_SEED = "GOLDEN_SEED",
}

export enum PropertyType {
  GREENHOUSE = "GREENHOUSE",
  WATER_TOWER = "WATER_TOWER",
  BEEHIVE = "BEEHIVE",
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
  GREENHOUSE = "GREENHOUSE",
  WATER_TOWER = "WATER_TOWER",
  BEEHIVE = "BEEHIVE",
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

export type SeedBag = Record<SeedType, number>;

export interface Inventory {
  seedBag: SeedBag;
  coins: number;
  // Legacy: keep seeds for backward compat with save, mapped to WHEAT
  seeds?: number;
}

export interface OwnedProperties {
  greenhouse: boolean;
  waterTower: boolean;
  beehive: boolean;
}

export interface GameState {
  grid: Grid;
  day: number;
  time: number;
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
  ownedProperties: OwnedProperties;
  selectedSeedType: SeedType;
  isShopOpen: boolean;
  /** Remaining monthly stock for limited seeds. Key = SeedType, value = units left this month. */
  shopStock: Partial<Record<SeedType, number>>;
  /** The in-game day when shopStock was last reset (start of the current "month"). */
  shopStockResetDay: number;
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
  TRANSACTION = "TRANSACTION",
}

export type GameAction =
  | { type: "MOVE_PLAYER"; direction: Vector2 }
  | { type: "INTERACT" }
  | { type: "TOGGLE_PAUSE" }
  | { type: "SAVE_GAME" }
  | { type: "BUY_SEED"; seedType: SeedType; quantity: number }
  | { type: "SELECT_SEED"; seedType: SeedType }
  | { type: "OPEN_SHOP" }
  | { type: "CLOSE_SHOP" }
  | { type: "BUY_LAND" }
  | { type: "USE_HARVESTER" }
  | { type: "BUY_HARVESTER" }
  | { type: "BUY_AUTO_SEEDS" }
  | { type: "BUY_AUTO_PLOW" }
  | { type: "BUY_PROPERTY"; propertyType: PropertyType };
