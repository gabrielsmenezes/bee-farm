import { Entity } from "./Entity";
import { EntityType, Vector2, PlantStage, SeedType } from "../types";

export class Plant extends Entity {
  stage: PlantStage;
  seedType: SeedType;
  private daysGrown: number = 0;
  private daysToNextStage: number;

  constructor(id: string, position: Vector2, seedType: SeedType = SeedType.WHEAT) {
    super(id, EntityType.PLANT, position);
    this.seedType = seedType;
    this.stage = PlantStage.SEED;
    this.daysToNextStage = this.getRandomGrowthTime();
  }

  update(_deltaTime: number) {
    // Growth is handled by GameEngine day pass
  }

  // Called once per Game Day
  public grow(growthSpeedMultiplier: number = 1.0) {
    if (this.stage === PlantStage.MATURE || this.stage === PlantStage.DEAD)
      return;

    // With a speed multiplier < 1, growth time is reduced (Water Tower buff)
    this.daysGrown++;

    const effectiveDays = this.daysToNextStage * growthSpeedMultiplier;
    if (this.daysGrown >= effectiveDays) {
      this.advanceStage();
      this.daysGrown = 0;
      this.daysToNextStage = this.getRandomGrowthTime();
    }
  }

  private advanceStage() {
    switch (this.stage) {
      case PlantStage.SEED:
        this.stage = PlantStage.GROWING;
        break;
      case PlantStage.GROWING:
        this.stage = PlantStage.MATURE;
        break;
    }
  }

  private getRandomGrowthTime(): number {
    return Math.floor(Math.random() * 3) + 1; // 1 to 3 random extra days on top of seed base
  }

  serialize(): any {
    return {
      id: this.id,
      position: this.position,
      stage: this.stage,
      seedType: this.seedType,
      daysGrown: this.daysGrown,
      daysToNextStage: this.daysToNextStage,
    };
  }

  static deserialize(data: any): Plant {
    const plant = new Plant(data.id, data.position, data.seedType ?? SeedType.WHEAT);
    plant.stage = data.stage;
    plant.daysGrown = data.daysGrown;
    plant.daysToNextStage = data.daysToNextStage;
    return plant;
  }
}
