import { Entity } from "./Entity";
import { EntityType, Vector2, PlantStage } from "../types";

export class Plant extends Entity {
  stage: PlantStage;
  private daysGrown: number = 0;
  private daysToNextStage: number;

  constructor(id: string, position: Vector2) {
    super(id, EntityType.PLANT, position);
    this.stage = PlantStage.SEED;
    this.daysToNextStage = this.getRandomGrowthTime();
  }

  update(deltaTime: number) {
    // Growth is handled by GameEngine day pass
  }

  // Called once per Game Day
  public grow() {
    if (this.stage === PlantStage.MATURE || this.stage === PlantStage.DEAD)
      return;

    this.daysGrown++;

    if (this.daysGrown >= this.daysToNextStage) {
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
    return Math.floor(Math.random() * 5) + 1; // 1 to 5 days
  }

  serialize(): any {
    return {
      id: this.id,
      position: this.position,
      stage: this.stage,
      daysGrown: this.daysGrown,
      daysToNextStage: this.daysToNextStage,
    };
  }

  static deserialize(data: any): Plant {
    const plant = new Plant(data.id, data.position);
    plant.stage = data.stage;
    plant.daysGrown = data.daysGrown;
    plant.daysToNextStage = data.daysToNextStage;
    return plant;
  }
}
