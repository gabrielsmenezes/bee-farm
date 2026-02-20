import { EventBus } from "./EventBus";
import { GameLoop } from "./GameLoop";
import { Grid } from "../world/Grid";
import { Player } from "../entities/Player";
import { Plant } from "../entities/Plant";
import {
  GameState,
  GameEvent,
  GameAction,
  Vector2,
  TileType,
  PlantStage,
  SeedType,
  PropertyType,
  SeedBag,
  OwnedProperties,
} from "../types";
import { SEED_REGISTRY } from "../seedRegistry";
import { PROPERTY_REGISTRY } from "../propertyRegistry";

const ALL_SEED_TYPES = Object.values(SeedType);

function makeEmptySeedBag(): SeedBag {
  return ALL_SEED_TYPES.reduce((bag, type) => {
    bag[type] = 0;
    return bag;
  }, {} as SeedBag);
}

export class GameEngine {
  private loop: GameLoop;
  public eventBus: EventBus;

  // State
  private grid: Grid;
  private player: Player;
  private entities: Record<string, Plant | Player> = {};
  private day: number = 1;

  private timeOfDay: number = 0;
  private readonly DAY_LENGTH = 5000; // 5 seconds per day

  // Inventory
  private coins: number = 10;
  private seedBag: SeedBag = makeEmptySeedBag();
  private expansionLevel: number = 1;

  // Shop UI state
  private isShopOpen: boolean = false;
  private selectedSeedType: SeedType = SeedType.WHEAT;

  // Tax System
  private readonly TAX_INTERVAL = 30;
  private readonly TAX_PER_TILE = 1;
  private nextTaxDay: number = 5;

  private isPaused: boolean = false;
  private hasHarvester: boolean = false;
  private hasAutoSeeds: boolean = false;
  private hasAutoPlow: boolean = false;

  // Property buildings
  private ownedProperties: OwnedProperties = {
    greenhouse: false,
    waterTower: false,
    beehive: false,
  };

  // Limited monthly shop stock
  private shopStock: Partial<Record<SeedType, number>> = {};
  private shopStockResetDay: number = 1;
  private readonly SHOP_MONTH = 28; // days per "month"

  /** Build the full shop stock from the seed registry (called on month reset). */
  private buildShopStock(): Partial<Record<SeedType, number>> {
    const stock: Partial<Record<SeedType, number>> = {};
    Object.values(SEED_REGISTRY).forEach((cfg) => {
      if (cfg.monthlyStock !== undefined) {
        stock[cfg.type] = cfg.monthlyStock;
      }
    });
    return stock;
  }

  constructor() {
    this.eventBus = new EventBus();
    this.grid = new Grid(30, 15);
    this.player = new Player("player-1", { x: 5, y: 5 });

    // Initialize shop stock from registry
    this.shopStock = this.buildShopStock();
    this.shopStockResetDay = 1;

    // Initialize Farmable Area
    this.updateFarmableArea();

    this.entities[this.player.id] = this.player;

    this.loop = new GameLoop(this.update.bind(this));
  }

  start() {
    this.loadGame();
    this.loop.start();
    this.eventBus.emit(GameEvent.STATE_CHANGED, this.getState());
  }

  stop() {
    this.loop.stop();
  }

  // ─── Save / Load ──────────────────────────────────────────────────────────

  private saveGame() {
    const state = this.getState();
    localStorage.setItem("bee-farm-save", JSON.stringify(state));
    alert("Game Saved!");
  }

  private loadGame() {
    const savedStateParams = localStorage.getItem("bee-farm-save");
    if (!savedStateParams) return;

    try {
      const s = JSON.parse(savedStateParams);

      this.grid = Grid.deserialize(s.grid);
      this.day = s.day;
      this.timeOfDay = s.time;
      this.coins = s.inventory.coins;

      // Migrate old saves: map legacy `seeds` (number) → WHEAT
      if (s.inventory.seedBag) {
        this.seedBag = { ...makeEmptySeedBag(), ...s.inventory.seedBag };
      } else if (typeof s.inventory.seeds === "number") {
        this.seedBag = makeEmptySeedBag();
        this.seedBag[SeedType.WHEAT] = s.inventory.seeds;
      }

      if (s.nextLandCost) {
        this.expansionLevel = Math.round(Math.log2(s.nextLandCost / 10) + 1);
      }

      this.nextTaxDay = s.tax.daysUntilDue + this.day;
      this.isPaused = s.isPaused ?? false;
      this.hasHarvester = s.hasHarvester ?? false;
      this.hasAutoSeeds = s.hasAutoSeeds ?? false;
      this.hasAutoPlow = s.hasAutoPlow ?? false;
      this.ownedProperties = s.ownedProperties ?? {
        greenhouse: false,
        waterTower: false,
        beehive: false,
      };
      this.selectedSeedType = s.selectedSeedType ?? SeedType.WHEAT;
      this.isShopOpen = false;

      // Restore shop stock, or reinitialize if missing from old save
      this.shopStock = s.shopStock ?? this.buildShopStock();
      this.shopStockResetDay = s.shopStockResetDay ?? this.day;

      this.entities = {};
      Object.values(s.entities).forEach((e: any) => {
        if (e.type === "PLAYER") {
          this.player = Player.deserialize(e);
          this.entities[this.player.id] = this.player;
        } else if (e.type === "PLANT") {
          const plant = Plant.deserialize(e);
          this.entities[plant.id] = plant;
        }
      });

      if (!this.entities[this.player.id]) {
        this.entities[this.player.id] = this.player;
      }
    } catch (e) {
      console.error("Failed to load game save:", e);
    }
  }

  // ─── State ────────────────────────────────────────────────────────────────

  getState(): GameState {
    const serializedEntities: any = {};
    Object.values(this.entities).forEach((e) => {
      serializedEntities[e.id] = { ...e };
    });

    return {
      grid: this.grid.serialize(),
      day: this.day,
      time: this.timeOfDay,
      entities: serializedEntities,
      inventory: {
        coins: this.coins,
        seedBag: { ...this.seedBag },
      },
      nextLandCost: this.getLandCost(),
      tax: {
        amount: this.calculateTax(),
        daysUntilDue: this.nextTaxDay - this.day,
      },
      isPaused: this.isPaused,
      hasHarvester: this.hasHarvester,
      hasAutoSeeds: this.hasAutoSeeds,
      hasAutoPlow: this.hasAutoPlow,
      ownedProperties: { ...this.ownedProperties },
      selectedSeedType: this.selectedSeedType,
      isShopOpen: this.isShopOpen,
      shopStock: { ...this.shopStock },
      shopStockResetDay: this.shopStockResetDay,
    };
  }

  // ─── Dispatch ─────────────────────────────────────────────────────────────

  dispatch(action: GameAction) {
    switch (action.type) {
      case "MOVE_PLAYER":
        if (!this.isPaused) this.handleMove(action.direction);
        break;
      case "INTERACT":
        if (!this.isPaused) this.handleInteract();
        break;
      case "TOGGLE_PAUSE":
        this.isPaused = !this.isPaused;
        break;
      case "SAVE_GAME":
        this.saveGame();
        break;
      case "BUY_SEED":
        this.buySeed(action.seedType, action.quantity);
        break;
      case "SELECT_SEED":
        this.selectedSeedType = action.seedType;
        break;
      case "OPEN_SHOP":
        this.isShopOpen = true;
        this.isPaused = true;
        break;
      case "CLOSE_SHOP":
        this.isShopOpen = false;
        this.isPaused = false;
        break;
      case "BUY_LAND":
        this.buyLand();
        break;
      case "BUY_HARVESTER":
        this.useHarvester();
        break;
      case "USE_HARVESTER":
        this.harvestAll();
        break;
      case "BUY_AUTO_SEEDS":
        this.buyAutoSeedsMachine();
        break;
      case "BUY_AUTO_PLOW":
        this.buyAutoPlowMachine();
        break;
      case "BUY_PROPERTY":
        this.buyProperty(action.propertyType);
        break;
    }
    this.eventBus.emit(GameEvent.STATE_CHANGED, this.getState());
  }

  // ─── Movement ─────────────────────────────────────────────────────────────

  private handleMove(direction: Vector2) {
    const newPos = {
      x: this.player.position.x + direction.x,
      y: this.player.position.y + direction.y,
    };
    if (this.grid.isValidPosition(newPos)) {
      this.player.position = newPos;
    }
  }

  // ─── Interaction ──────────────────────────────────────────────────────────

  private handleInteract() {
    const pos = this.player.position;
    const tile = this.grid.getTile(pos);
    if (!tile) return;

    // Building tiles no longer exist on the grid — interactions handled by sidebar UI.

    // Farm tile interaction
    const plantId = tile.entityId;
    if (plantId) {
      const plant = this.entities[plantId] as Plant;
      if (plant && plant.stage === PlantStage.MATURE) {
        this.harvestPlant(plant, tile);
      }
    } else {
      if (tile.type === TileType.GRASS) {
        if (tile.isFarmable) {
          this.grid.setTileType(pos, TileType.SOIL);
        }
      } else if (tile.type === TileType.SOIL) {
        this.plantSeed(pos, tile);
      }
    }
  }

  // ─── Harvesting ───────────────────────────────────────────────────────────

  private harvestPlant(plant: Plant, tile: any) {
    const cfg = SEED_REGISTRY[plant.seedType];
    const buffs = this.getPropertyBuffsAt(plant.position);

    // Value buff (Greenhouse)
    const harvestValue = Math.round(cfg.harvestValue * buffs.valueMultiplier);
    this.coins += harvestValue;

    // Seed drop (Beehive buffed)
    const effectiveSeedDropChance = Math.min(
      1.0,
      cfg.seedDropChance * buffs.seedDropMultiplier
    );
    if (Math.random() < effectiveSeedDropChance) {
      this.seedBag[plant.seedType] = (this.seedBag[plant.seedType] ?? 0) + 1;
    }

    // Poison Ivy: wilt adjacent plants
    if (plant.seedType === SeedType.POISON_IVY) {
      this.wiltNeighbors(plant.position);
    }

    this.removeEntity(plant.id);
    tile.entityId = null;
    tile.type = TileType.GRASS;
  }

  private harvestAll() {
    Object.values(this.entities).forEach((entity) => {
      if (entity instanceof Plant && entity.stage === PlantStage.MATURE) {
        const tile = this.grid.getTile(entity.position);
        if (tile) {
          this.harvestPlant(entity, tile);
        }
      }
    });
  }

  private wiltNeighbors(pos: Vector2) {
    const directions = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: 0, y: 1 },
    ];
    directions.forEach((d) => {
      const neighborPos = { x: pos.x + d.x, y: pos.y + d.y };
      const tile = this.grid.getTile(neighborPos);
      if (tile?.entityId) {
        const neighbor = this.entities[tile.entityId] as Plant;
        if (neighbor instanceof Plant) {
          neighbor.stage = PlantStage.DEAD;
        }
      }
    });
  }

  // ─── Planting ─────────────────────────────────────────────────────────────

  private plantSeed(pos: Vector2, tile: any) {
    const seedType = this.selectedSeedType;
    if ((this.seedBag[seedType] ?? 0) <= 0) {
      console.log(`No ${seedType} seeds!`);
      return;
    }
    const newPlant = new Plant(`plant-${Date.now()}`, { ...pos }, seedType);
    this.addEntity(newPlant);
    tile.entityId = newPlant.id;
    tile.type = TileType.WATERED_SOIL;
    this.seedBag[seedType]--;
  }

  // ─── Property Buff Lookup ─────────────────────────────────────────────────

  /**
   * Returns combined buff multipliers for a position based on
   * owned property buildings within range.
   */
  private getPropertyBuffsAt(pos: Vector2): {
    valueMultiplier: number;
    growthSpeedMultiplier: number;
    seedDropMultiplier: number;
  } {
    let valueMultiplier = 1.0;
    let growthSpeedMultiplier = 1.0;
    let seedDropMultiplier = 1.0;

    const propertyTileMap: Array<{
      tileType: TileType;
      propType: PropertyType;
      owned: boolean;
    }> = [
      {
        tileType: TileType.GREENHOUSE,
        propType: PropertyType.GREENHOUSE,
        owned: this.ownedProperties.greenhouse,
      },
      {
        tileType: TileType.WATER_TOWER,
        propType: PropertyType.WATER_TOWER,
        owned: this.ownedProperties.waterTower,
      },
      {
        tileType: TileType.BEEHIVE,
        propType: PropertyType.BEEHIVE,
        owned: this.ownedProperties.beehive,
      },
    ];

    propertyTileMap.forEach(({ propType, owned }) => {
      if (!owned) return;
      const cfg = PROPERTY_REGISTRY[propType];
      const propPos = this.getPropertyPosition(propType);
      if (!propPos) return;

      const dist = Math.max(
        Math.abs(pos.x - propPos.x),
        Math.abs(pos.y - propPos.y)
      );

      if (dist <= cfg.radius) {
        if (cfg.buffType === "VALUE") valueMultiplier *= cfg.buffMultiplier;
        if (cfg.buffType === "GROWTH_SPEED")
          growthSpeedMultiplier *= cfg.buffMultiplier;
        if (cfg.buffType === "SEED_DROP")
          seedDropMultiplier *= cfg.buffMultiplier;
      }
    });

    return { valueMultiplier, growthSpeedMultiplier, seedDropMultiplier };
  }

  /** Returns the grid position of a property tile */
  private getPropertyPosition(propType: PropertyType): Vector2 | null {
    const rows = this.grid.serialize();
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        const tile = rows[y][x];
        if (
          (propType === PropertyType.GREENHOUSE &&
            tile.type === TileType.GREENHOUSE) ||
          (propType === PropertyType.WATER_TOWER &&
            tile.type === TileType.WATER_TOWER) ||
          (propType === PropertyType.BEEHIVE && tile.type === TileType.BEEHIVE)
        ) {
          return { x, y };
        }
      }
    }
    return null;
  }

  // ─── Machines ─────────────────────────────────────────────────────────────

  private useHarvester() {
    const HARVESTER_COST = 500;
    if (!this.hasHarvester) {
      if (this.coins >= HARVESTER_COST) {
        this.coins -= HARVESTER_COST;
        this.hasHarvester = true;
      }
    } else {
      this.harvestAll();
    }
  }

  private buyAutoSeedsMachine() {
    const COST = 500;
    if (!this.hasAutoSeeds && this.coins >= COST) {
      this.coins -= COST;
      this.hasAutoSeeds = true;
    }
  }

  private runAutoSeeds() {
    const cfg = SEED_REGISTRY[SeedType.WHEAT];
    const TARGET = 10;
    let bought = 0;
    for (let i = 0; i < TARGET; i++) {
      if (this.coins >= cfg.cost) {
        this.coins -= cfg.cost;
        this.seedBag[SeedType.WHEAT] = (this.seedBag[SeedType.WHEAT] ?? 0) + 1;
        bought++;
      } else {
        break;
      }
    }
    if (bought > 0) console.log(`Auto Seeds: Bought ${bought} wheat seeds.`);
  }

  private buyAutoPlowMachine() {
    const COST = 500;
    if (!this.hasAutoPlow && this.coins >= COST) {
      this.coins -= COST;
      this.hasAutoPlow = true;
    }
  }

  private runAutoPlow() {
    const PLOW_COUNT = 10;
    let plowed = 0;
    const rows = this.grid.serialize();
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        if (plowed >= PLOW_COUNT) break;
        const tile = this.grid.getTile({ x, y });
        if (tile && tile.type === TileType.GRASS && tile.isFarmable) {
          this.grid.setTileType({ x, y }, TileType.SOIL);
          plowed++;
        }
      }
      if (plowed >= PLOW_COUNT) break;
    }
  }

  // ─── Properties ───────────────────────────────────────────────────────────

  private buyProperty(propType: PropertyType) {
    const cfg = PROPERTY_REGISTRY[propType];

    if (this.coins < cfg.cost) {
      console.log(`Not enough coins for ${cfg.name}! Need ${cfg.cost}.`);
      return;
    }

    const pos = this.player.position;
    const tile = this.grid.getTile(pos);

    if (!tile) {
      console.log("Invalid position.");
      return;
    }

    // Don't allow placing on top of plants or existing buildings
    if (tile.entityId) {
      console.log("Can't place here — remove the plant first.");
      return;
    }
    const buildingTypes: TileType[] = [
      TileType.SHOP, TileType.LAND_OFFICE, TileType.HARVESTER,
      TileType.AUTO_SEEDS, TileType.AUTO_PLOW,
      TileType.GREENHOUSE, TileType.WATER_TOWER, TileType.BEEHIVE,
    ];
    if (buildingTypes.includes(tile.type)) {
      console.log("Can't place here — already a building on this tile.");
      return;
    }

    // Deduct cost and place the tile
    this.coins -= cfg.cost;

    const tileTypeMap: Record<PropertyType, TileType> = {
      [PropertyType.GREENHOUSE]: TileType.GREENHOUSE,
      [PropertyType.WATER_TOWER]: TileType.WATER_TOWER,
      [PropertyType.BEEHIVE]: TileType.BEEHIVE,
    };
    this.grid.setTileType(pos, tileTypeMap[propType]);

    // Update owned flags (tracks "at least one placed")
    if (propType === PropertyType.GREENHOUSE) this.ownedProperties.greenhouse = true;
    if (propType === PropertyType.WATER_TOWER) this.ownedProperties.waterTower = true;
    if (propType === PropertyType.BEEHIVE) this.ownedProperties.beehive = true;

    console.log(`${cfg.name} placed at (${pos.x}, ${pos.y})!`);
  }

  // ─── Seed Shop ────────────────────────────────────────────────────────────

  private buySeed(seedType: SeedType, quantity: number) {
    const cfg = SEED_REGISTRY[seedType];

    // Enforce monthly stock limit for limited seeds
    if (cfg.monthlyStock !== undefined) {
      const remaining = this.shopStock[seedType] ?? 0;
      if (remaining <= 0) {
        console.log(`${cfg.name} is out of stock this month!`);
        return;
      }
      // Cap quantity to what's available
      const buyQty = Math.min(quantity, remaining);
      const totalCost = cfg.cost * buyQty;
      if (this.coins < totalCost) return;
      this.coins -= totalCost;
      this.seedBag[seedType] = (this.seedBag[seedType] ?? 0) + buyQty;
      this.shopStock[seedType] = remaining - buyQty;
      return;
    }

    // Unlimited seeds
    const totalCost = cfg.cost * quantity;
    if (this.coins >= totalCost) {
      this.coins -= totalCost;
      this.seedBag[seedType] = (this.seedBag[seedType] ?? 0) + quantity;
    }
  }

  // ─── Land ─────────────────────────────────────────────────────────────────

  private getLandCost(): number {
    return 10 * Math.pow(2, this.expansionLevel - 1);
  }

  private buyLand() {
    const cost = this.getLandCost();
    if (this.coins >= cost) {
      this.coins -= cost;
      this.expansionLevel++;
      this.updateFarmableArea();
    }
  }

  private updateFarmableArea() {
    const centerX = 15;
    const centerY = 5;
    const halfSize = this.expansionLevel;
    const startX = centerX - halfSize + 1;
    const endX = centerX + halfSize;
    const startY = centerY - halfSize + 1;
    const endY = centerY + halfSize;

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        if (this.grid.isValidPosition({ x, y })) {
          this.grid.setTileFarmable({ x, y }, true);
        }
      }
    }
  }

  // ─── Entity Management ────────────────────────────────────────────────────

  private addEntity(entity: Plant | Player) {
    this.entities[entity.id] = entity;
  }

  private removeEntity(id: string) {
    delete this.entities[id];
  }

  // ─── Day Cycle ────────────────────────────────────────────────────────────

  private dayPass() {
    this.day++;
    this.timeOfDay = 0;

    // Grow plants, applying Water Tower growth speed buff
    Object.values(this.entities).forEach((entity) => {
      if (entity instanceof Plant) {
        const buffs = this.getPropertyBuffsAt(entity.position);
        entity.grow(buffs.growthSpeedMultiplier);
      }
    });

    if (this.hasAutoSeeds) this.runAutoSeeds();
    if (this.hasAutoPlow) this.runAutoPlow();

    // Monthly shop stock reset every SHOP_MONTH days
    if (this.day - this.shopStockResetDay >= this.SHOP_MONTH) {
      this.shopStock = this.buildShopStock();
      this.shopStockResetDay = this.day;
      console.log("Shop stock refreshed for the new month!");
    }

    if (this.day >= this.nextTaxDay) {
      this.payTax();
      this.nextTaxDay += this.TAX_INTERVAL;
    }

    this.eventBus.emit(GameEvent.DAY_PASSED, this.day);
  }

  private calculateTax(): number {
    let farmableCount = 0;
    this.grid.serialize().forEach((row) => {
      row.forEach((tile) => {
        if (tile.isFarmable) farmableCount++;
      });
    });
    return farmableCount * this.TAX_PER_TILE;
  }

  private payTax() {
    const tax = this.calculateTax();
    this.coins -= tax;
    console.log(`Tax Day! Paid ${tax} coins.`);
  }

  // ─── Game Loop ────────────────────────────────────────────────────────────

  private update(deltaTime: number) {
    if (this.isPaused) return;

    this.timeOfDay += deltaTime;
    if (this.timeOfDay >= this.DAY_LENGTH) {
      this.dayPass();
    }

    Object.values(this.entities).forEach((entity) => {
      entity.update(deltaTime);
    });

    this.eventBus.emit(GameEvent.TIME_TICK, this.timeOfDay);
    this.eventBus.emit(GameEvent.STATE_CHANGED, this.getState());
  }
}
