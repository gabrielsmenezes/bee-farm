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
} from "../types";

export class GameEngine {
  private loop: GameLoop;
  public eventBus: EventBus;

  // State
  private grid: Grid;
  private player: Player;
  private entities: Record<string, Plant | Player> = {}; // Generic Entity? For now Plant | Player
  private day: number = 1;

  // Let's say day length is 24 seconds for demo? Or 1 minute?
  // Let's use 0-100 as percentage of day for simplicity, or just raw ms.
  private timeOfDay: number = 0;
  private readonly DAY_LENGTH = 5000; // 5 seconds per day for testing

  // Inventory
  private coins: number = 10;
  private seeds: number = 0;
  // Level 0: 2x2. Level 1: 4x4. etc.
  private expansionLevel: number = 1;

  // Tax System
  private readonly TAX_INTERVAL = 30; // Days
  private readonly TAX_PER_TILE = 1; // 1 Coin per tile? Or per expansion level?
  // Let's do per Farmable Tile.
  private nextTaxDay: number = 5;

  private isPaused: boolean = false;
  private hasHarvester: boolean = false;
  private hasAutoSeeds: boolean = false;
  private hasAutoPlow: boolean = false;

  constructor() {
    this.eventBus = new EventBus();
    this.grid = new Grid(20, 20);
    this.player = new Player("player-1", { x: 5, y: 5 });

    // Place a Shop Tile
    this.grid.setTileType({ x: 2, y: 2 }, TileType.SHOP);

    // Place Land Office
    this.grid.setTileType({ x: 17, y: 2 }, TileType.LAND_OFFICE);

    // Place Harvester Tile
    this.grid.setTileType({ x: 2, y: 5 }, TileType.HARVESTER);

    // Place Auto Seeds Tile
    this.grid.setTileType({ x: 2, y: 8 }, TileType.AUTO_SEEDS);

    // Place Auto Plow Tile
    this.grid.setTileType({ x: 2, y: 11 }, TileType.AUTO_PLOW);

    // Initialize Farmable Area (Centered at 10,10)
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

  private saveGame() {
    const state = this.getState();
    const serializedState = JSON.stringify(state);
    localStorage.setItem("bee-farm-save", serializedState);
    console.log("Game Saved!");
    alert("Game Saved!");
  }

  private loadGame() {
    const savedStateParams = localStorage.getItem("bee-farm-save");
    if (savedStateParams) {
      try {
        const savedState = JSON.parse(savedStateParams);

        // Restore Grid
        this.grid = Grid.deserialize(savedState.grid);

        // Restore Simple Props
        this.day = savedState.day;
        this.timeOfDay = savedState.time; // Verify serialized name
        this.coins = savedState.inventory.coins;
        this.seeds = savedState.inventory.seeds;
        this.expansionLevel =
          Math.log2(savedState.nextLandCost / 10) + 1 ||
          Math.log2(savedState.nextLandCost / 10) + 1; // Reverse eng or just store level?
        // Note: expansionLevel wasn't explicitly in GameState interface, but nextLandCost was.
        // Let's recalculate expansionLevel based on Land Cost or just add expansionLevel to GameState?
        // For now, let's just infer it or better: Add it to GameState in next refactor?
        // ACTUALLY, I missed adding expansionLevel to GameState.
        // Let's rely on re-calculating or just defaults for now if not critical,
        // BUT it is critical for farmable area.
        // Let's see... getLandCost depends on expansionLevel.
        // logic: cost = 10 * 2^(level-1). => level = log2(cost/10) + 1.
        if (savedState.nextLandCost) {
          this.expansionLevel = Math.log2(savedState.nextLandCost / 10) + 1;
        }

        this.nextTaxDay = savedState.tax.daysUntilDue + this.day;
        this.isPaused = true; // Always pause on load? Or savedState.isPaused?
        // savedState.isPaused might be true if they saved while paused.
        // Let's force consistent state or use saved.
        this.isPaused = savedState.isPaused;

        this.hasHarvester = savedState.hasHarvester;
        this.hasAutoSeeds = savedState.hasAutoSeeds;
        this.hasAutoPlow = savedState.hasAutoPlow;

        // Restore Entities
        this.entities = {};
        // Player
        // We know player ID is in saved entities?
        // Actually getState() saves all entities.
        // We need to re-instantiate correct classes.
        Object.values(savedState.entities).forEach((e: any) => {
          if (e.type === "PLAYER") {
            this.player = Player.deserialize(e);
            this.entities[this.player.id] = this.player;
          } else if (e.type === "PLANT") {
            const plant = Plant.deserialize(e);
            this.entities[plant.id] = plant;
          }
        });

        // Ensure player exists (if save file was weird)
        if (!this.entities[this.player.id]) {
          this.entities[this.player.id] = this.player;
        }

        console.log("Game Loaded!");
      } catch (e) {
        console.error("Failed to load game save:", e);
      }
    }

    // Force Static Map Tiles (to fix stale save data types)
    console.log("Forcing Static Map Tiles...");
    // Place a Shop Tile
    this.grid.setTileType({ x: 2, y: 2 }, TileType.SHOP);
    // Place Land Office
    this.grid.setTileType({ x: 17, y: 2 }, TileType.LAND_OFFICE);
    // Place Harvester Tile
    this.grid.setTileType({ x: 2, y: 5 }, TileType.HARVESTER);
    // Place Auto Seeds Tile
    this.grid.setTileType({ x: 2, y: 8 }, TileType.AUTO_SEEDS);
    // Place Auto Plow Tile
    this.grid.setTileType({ x: 2, y: 11 }, TileType.AUTO_PLOW);
  }

  getState(): GameState {
    const serializedEntities: any = {};
    Object.values(this.entities).forEach((e) => {
      serializedEntities[e.id] = { ...e }; // Shallow copy
    });

    return {
      grid: this.grid.serialize(),
      day: this.day,
      time: this.timeOfDay,
      entities: serializedEntities,
      inventory: {
        coins: this.coins,
        seeds: this.seeds,
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
    };
  }

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
    }
    this.eventBus.emit(GameEvent.STATE_CHANGED, this.getState());
  }

  private handleMove(direction: Vector2) {
    const newPos = {
      x: this.player.position.x + direction.x,
      y: this.player.position.y + direction.y,
    };

    if (this.grid.isValidPosition(newPos)) {
      this.player.position = newPos;
    }
  }

  private handleInteract() {
    const pos = this.player.position;
    const tile = this.grid.getTile(pos);

    if (!tile) return;

    // Check interaction with SHOP
    if (tile.type === TileType.SHOP) {
      this.buySeed();
      return;
    }

    // Check interaction with LAND_OFFICE
    if (tile.type === TileType.LAND_OFFICE) {
      this.buyLand();
      return;
    }

    // Check interaction with HARVESTER
    if (tile.type === TileType.HARVESTER) {
      this.useHarvester();
      return;
    }

    // Check interaction with AUTO_SEEDS
    if (tile.type === TileType.AUTO_SEEDS) {
      this.buyAutoSeedsMachine();
      return;
    }

    // Check interaction with AUTO_PLOW
    if (tile.type === TileType.AUTO_PLOW) {
      this.buyAutoPlowMachine();
      return;
    }

    // Logic:
    // If Grass -> Hoe to Soil (ONLY IF FARMABLE)
    // If Soil -> Plant Seed
    // If Plant (Mature) -> Harvest

    // Check if there's a plant here
    const plantId = tile.entityId;
    if (plantId) {
      const plant = this.entities[plantId] as Plant;
      if (plant && plant.stage === PlantStage.MATURE) {
        // Harvest
        this.removeEntity(plantId);
        tile.entityId = null;
        tile.type = TileType.GRASS; // Revert to unplowed (Grass)

        // Reward: Sell produce + Chance for Seed
        const produceValue = 5;
        this.coins += produceValue;

        // 50% chance to get a seed back
        if (Math.random() > 0.5) {
          this.seeds += 1;
        }
      }
    } else {
      // No plant, check tile type
      if (tile.type === TileType.GRASS) {
        if (tile.isFarmable) {
          this.grid.setTileType(pos, TileType.SOIL);
        } else {
          // Feedback: Cannot farm here
          console.log("Cannot farm here! Buy more land.");
        }
      } else if (tile.type === TileType.SOIL) {
        // Plant seed
        if (this.seeds > 0) {
          const newPlant = new Plant(`plant-${Date.now()}`, { ...pos });
          this.addEntity(newPlant);
          tile.entityId = newPlant.id;
          tile.type = TileType.WATERED_SOIL; // Auto water for demo?
          this.seeds--;
        } else {
          // Feedback? "No seeds!"
          console.log("Not enough seeds!");
        }
      }
    }
  }

  private useHarvester() {
    const HARVESTER_COST = 500;

    if (!this.hasHarvester) {
      // Try to buy
      if (this.coins >= HARVESTER_COST) {
        this.coins -= HARVESTER_COST;
        this.hasHarvester = true;
        console.log("Harvester Bought!");
      } else {
        console.log("Not enough coins to buy Harvester! Need 500.");
      }
    } else {
      // Use Harvester
      console.log("Using Harvester...");
      this.harvestAll();
    }
  }

  private harvestAll() {
    Object.values(this.entities).forEach((entity) => {
      if (entity instanceof Plant && entity.stage === PlantStage.MATURE) {
        const tile = this.grid.getTile(entity.position);
        if (tile) {
          this.removeEntity(entity.id);
          tile.entityId = null;
          tile.type = TileType.GRASS; // Revert to unplowed (Grass)

          // Reward: Sell produce + Chance for Seed
          const produceValue = 5;
          this.coins += produceValue;

          // 50% chance to get a seed back
          if (Math.random() > 0.5) {
            this.seeds += 1;
          }
        }
      }
    });
  }

  private buyAutoSeedsMachine() {
    const COST = 500;
    if (!this.hasAutoSeeds) {
      if (this.coins >= COST) {
        this.coins -= COST;
        this.hasAutoSeeds = true;
        console.log("Auto Seeds Machine Bought!");
      } else {
        console.log("Not enough coins to buy Auto Seeds Machine! Need 500.");
      }
    } else {
      console.log("Auto Seeds Machine already active.");
    }
  }

  private runAutoSeeds() {
    const TARGET = 10;
    const PRICE = 1;
    let bought = 0;

    // Attempt to buy up to 10 seeds
    for (let i = 0; i < TARGET; i++) {
      if (this.coins >= PRICE) {
        this.coins -= PRICE;
        this.seeds++;
        bought++;
      } else {
        break;
      }
    }

    if (bought > 0) {
      console.log(`Auto Seeds: Bought ${bought} seeds.`);
    }
  }

  private buyAutoPlowMachine() {
    const COST = 500;
    if (!this.hasAutoPlow) {
      if (this.coins >= COST) {
        this.coins -= COST;
        this.hasAutoPlow = true;
        console.log("Auto Plow Machine Bought!");
      } else {
        console.log("Not enough coins to buy Auto Plow Machine! Need 500.");
      }
    } else {
      console.log("Auto Plow Machine already active.");
    }
  }

  private runAutoPlow() {
    const PLOW_COUNT = 10;
    let plowed = 0;

    // Iterate through grid to find unplowed farmable tiles
    // We can randomize or just scan top-down
    const rows = this.grid.serialize();
    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        if (plowed >= PLOW_COUNT) break;

        const tile = this.grid.getTile({ x, y });
        if (tile && tile.type === TileType.GRASS && tile.isFarmable) {
          // Plow it
          this.grid.setTileType({ x, y }, TileType.SOIL);
          plowed++;
        }
      }
      if (plowed >= PLOW_COUNT) break;
    }

    if (plowed > 0) {
      console.log(`Auto Plow: Plowed ${plowed} tiles.`);
    }
  }

  private buySeed() {
    const SEED_COST = 1;
    if (this.coins >= SEED_COST) {
      this.coins -= SEED_COST;
      this.seeds++;
      // Maybe emit transaction event?
    }
  }

  private getLandCost(): number {
    // Exponential cost: 10 * 2^(level-1)
    // Level 1 (start) -> Cost for Level 2 = 10 * 1 = 10
    // Level 2 -> Cost for Level 3 = 10 * 2 = 20
    // Level 3 -> Cost for Level 4 = 10 * 4 = 40
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
    // Center is roughly 10, 10.
    // Level 1: 1 radius (3x3) or 2 radius?
    // User requested "start with 4 tiles" -> 2x2.
    // Let's implement concentric squares.
    const centerX = 10;
    const centerY = 10;

    // Size = expansionLevel * 2.
    // Level 1: 2x2. Range: -0 to +1
    // Level 2: 4x4. Range: -1 to +2
    // Level 3: 6x6. Range: -2 to +3

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

  private addEntity(entity: Plant | Player) {
    this.entities[entity.id] = entity;
  }

  private removeEntity(id: string) {
    delete this.entities[id];
  }

  private dayPass() {
    this.day++;
    this.timeOfDay = 0;

    // Grow plants
    Object.values(this.entities).forEach((entity) => {
      if (entity instanceof Plant) {
        entity.grow();
      }
    });

    // Check for Auto Seeds
    if (this.hasAutoSeeds) {
      this.runAutoSeeds();
    }

    // Check for Auto Plow
    if (this.hasAutoPlow) {
      this.runAutoPlow();
    }

    // Tax Check
    if (this.day >= this.nextTaxDay) {
      this.payTax();
      this.nextTaxDay += this.TAX_INTERVAL;
    }

    this.eventBus.emit(GameEvent.DAY_PASSED, this.day);
  }

  private calculateTax(): number {
    // Count farmable tiles
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

  private update(deltaTime: number) {
    if (this.isPaused) return;

    // Update Time
    this.timeOfDay += deltaTime;
    if (this.timeOfDay >= this.DAY_LENGTH) {
      this.dayPass();
    }

    // Update Entities
    Object.values(this.entities).forEach((entity) => {
      entity.update(deltaTime);
    });

    // Emit 'tick' event if needed for smooth animations,
    // but for React state we might want to throttle state updates?
    // For now, let's emit every frame and let React handle it via subscriber or throttle in adapter.
    // Or better: emit ONLY on significant changes?
    // Player movement is event-driven (dispatch).
    // Plant growth happens over time.
    // Time changes every frame.
    // We should emit STATE_CHANGED on tick.
    this.eventBus.emit(GameEvent.TIME_TICK, this.timeOfDay);
    this.eventBus.emit(GameEvent.STATE_CHANGED, this.getState());
  }
}
