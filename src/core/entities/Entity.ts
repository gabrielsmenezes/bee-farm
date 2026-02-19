import { Entity as EntityType, EntityType as EType, Vector2 } from "../types";

export abstract class Entity implements EntityType {
  id: string;
  type: EType;
  position: Vector2;

  constructor(id: string, type: EType, position: Vector2) {
    this.id = id;
    this.type = type;
    this.position = position;
  }

  abstract update(deltaTime: number): void;
}
