import { EntityType, Vector2 } from "../types";

export class Pest {
  id: string;
  type = EntityType.PEST as const;
  position: Vector2;
  /** How many turns this pest has been inside a Beehive radius (bees sting it) */
  beehiveStingTurns: number = 0;

  constructor(id: string, position: Vector2) {
    this.id = id;
    this.position = { ...position };
  }

  /** No-op — pest movement is handled by tickPests() in GameEngine, not the game loop */
  update(_deltaTime: number) {}

  static deserialize(data: any): Pest {
    const p = new Pest(data.id, data.position);
    p.beehiveStingTurns = data.beehiveStingTurns ?? 0;
    return p;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      position: { ...this.position },
      beehiveStingTurns: this.beehiveStingTurns,
    };
  }
}
