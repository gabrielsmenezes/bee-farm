import { Entity } from "./Entity";
import { EntityType, Vector2 } from "../types";

export class Player extends Entity {
  constructor(id: string, position: Vector2) {
    super(id, EntityType.PLAYER, position);
  }

  update(_deltaTime: number) {
    // Player update logic (animation, etc? usually controlled by input)
    // Movement is instantaneous in grid-based for now, handled by GameEngine
    // But we could add smooth movement logic here later.
  }

  static deserialize(data: any): Player {
    return new Player(data.id, data.position);
  }
}
