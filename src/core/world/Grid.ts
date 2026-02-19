import { Grid as GridType, Tile, TileType, Vector2 } from "../types";

export class Grid {
  width: number;
  height: number;
  tiles: GridType;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.tiles = this.generateGrid();
  }

  private generateGrid(): GridType {
    const grid: GridType = [];
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        row.push({
          x,
          y,
          type: TileType.GRASS,
          entityId: null,
          isFarmable: false,
        });
      }
      grid.push(row);
    }
    return grid;
  }

  isValidPosition(pos: Vector2): boolean {
    return (
      pos.x >= 0 && pos.x < this.width && pos.y >= 0 && pos.y < this.height
    );
  }

  getTile(pos: Vector2): Tile | null {
    if (!this.isValidPosition(pos)) return null;
    return this.tiles[pos.y][pos.x];
  }

  setTileType(pos: Vector2, type: TileType) {
    const tile = this.getTile(pos);
    if (tile) {
      tile.type = type;
    }
  }

  setTileFarmable(pos: Vector2, isFarmable: boolean) {
    const tile = this.getTile(pos);
    if (tile) {
      tile.isFarmable = isFarmable;
    }
  }

  serialize(): GridType {
    // Basic deep copy for now to ensure immutability in UI if needed
    return JSON.parse(JSON.stringify(this.tiles));
  }

  static deserialize(data: GridType): Grid {
    const grid = new Grid(data[0].length, data.length);
    grid.tiles = data;
    return grid;
  }
}
