export type Vector2 = {
  x: number;
  y: number;
};

export enum EntityType {
  PLAYER = "PLAYER",
  PLANT  = "PLANT",
  PEST   = "PEST",
}

export enum SeedType {
  WHEAT       = "WHEAT",
  SUNFLOWER   = "SUNFLOWER",
  MUSHROOM    = "MUSHROOM",
  BLUEBERRY   = "BLUEBERRY",
  POISON_IVY  = "POISON_IVY",
  GOLDEN_SEED = "GOLDEN_SEED",
}

export enum PropertyType {
  GREENHOUSE  = "GREENHOUSE",
  WATER_TOWER = "WATER_TOWER",
  BEEHIVE     = "BEEHIVE",
  SCARECROW   = "SCARECROW",
}

export enum TileType {
  GRASS        = "GRASS",
  SOIL         = "SOIL",
  WATERED_SOIL = "WATERED_SOIL",
  BLIGHTED     = "BLIGHTED",   // contaminated — plants die, spreads to neighbors
  SHOP         = "SHOP",
  LAND_OFFICE  = "LAND_OFFICE",
  HARVESTER    = "HARVESTER",
  AUTO_SEEDS   = "AUTO_SEEDS",
  AUTO_PLOW    = "AUTO_PLOW",
  GREENHOUSE   = "GREENHOUSE",
  WATER_TOWER  = "WATER_TOWER",
  BEEHIVE      = "BEEHIVE",
  SCARECROW    = "SCARECROW",
}

export enum PlantStage {
  SEED    = "SEED",
  GROWING = "GROWING",
  MATURE  = "MATURE",
  DEAD    = "DEAD",
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
  pesticides: number;
  // Legacy: keep seeds for backward compat with save, mapped to WHEAT
  seeds?: number;
}

export interface OwnedProperties {
  greenhouse: boolean;
  waterTower: boolean;
  beehive: boolean;
  scarecrow: boolean;
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
  /** Remaining monthly stock for limited seeds. */
  shopStock: Partial<Record<SeedType, number>>;
  shopStockResetDay: number;
  /** Number of active pests on the farm. */
  pestCount: number;
  /** Whether any blight tiles exist on the grid. */
  hasActiveBlight: boolean;
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Vector2;
}

export enum GameEvent {
  STATE_CHANGED   = "STATE_CHANGED",
  PLAYER_MOVED    = "PLAYER_MOVED",
  TIME_TICK       = "TIME_TICK",
  DAY_PASSED      = "DAY_PASSED",
  TRANSACTION     = "TRANSACTION",
  PEST_SPAWNED    = "PEST_SPAWNED",
  BLIGHT_SPREAD   = "BLIGHT_SPREAD",
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
  | { type: "BUY_PROPERTY"; propertyType: PropertyType }
  | { type: "BUY_PESTICIDE"; quantity: number }
  | { type: "USE_PESTICIDE" };
