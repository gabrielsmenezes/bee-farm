import React from "react";
import { EntityType, GameState, SeedType, TileType } from "../../core/types";
import { TileRenderer } from "./TileRenderer";
import { Plant } from "../../core/entities/Plant";
import { Player } from "../../core/entities/Player";
import { PROPERTY_REGISTRY } from "../../core/propertyRegistry";
import { PropertyType } from "../../core/types";

interface Props {
  gameState: GameState;
}

// Each property type gets a distinct border style so they're visually differentiated
const PROPERTY_BORDER_STYLE: Record<PropertyType, string> = {
  [PropertyType.GREENHOUSE]: "solid",
  [PropertyType.WATER_TOWER]: "dashed",
  [PropertyType.BEEHIVE]: "dotted",
  [PropertyType.SCARECROW]: "dashed",
};

const TILE_TO_PROPERTY: Partial<Record<TileType, PropertyType>> = {
  [TileType.GREENHOUSE]: PropertyType.GREENHOUSE,
  [TileType.WATER_TOWER]: PropertyType.WATER_TOWER,
  [TileType.BEEHIVE]: PropertyType.BEEHIVE,
  [TileType.SCARECROW]: PropertyType.SCARECROW,
};

export type BuffHighlight = { color: string; borderStyle: string };

export const GridRenderer: React.FC<Props> = ({ gameState }) => {
  const { grid } = gameState;

  // ── Collect all placed property buildings ──────────────────────────
  const propertySources: Array<{
    x: number;
    y: number;
    radius: number;
    color: string;
    propType: PropertyType;
  }> = [];

  grid.forEach((row, y) =>
    row.forEach((tile, x) => {
      const propType = TILE_TO_PROPERTY[tile.type];
      if (propType) {
        const cfg = PROPERTY_REGISTRY[propType];
        propertySources.push({
          x,
          y,
          radius: cfg.radius,
          color: cfg.color,
          propType,
        });
      }
    }),
  );

  // ── Build a lookup: "x,y" → array of highlights (one per property type) ──
  const buffMap = new Map<string, BuffHighlight[]>();

  propertySources.forEach(({ x: px, y: py, radius, color, propType }) => {
    const highlight: BuffHighlight = {
      color,
      borderStyle: PROPERTY_BORDER_STYLE[propType],
    };
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue; // skip the building tile itself
        const key = `${px + dx},${py + dy}`;
        const existing = buffMap.get(key) ?? [];
        // Avoid duplicate entries for same property type on same tile
        if (
          !existing.some(
            (h) => h.color === color && h.borderStyle === highlight.borderStyle,
          )
        ) {
          buffMap.set(key, [...existing, highlight]);
        }
      }
    }
  });

  // ── Entity helpers ─────────────────────────────────────────────────
  const getPlantAt = (
    entityId: string | null | undefined,
  ): Plant | undefined => {
    if (!entityId) return undefined;
    const entity = gameState.entities[entityId];
    if (entity && entity.type === "PLANT") return entity as Plant;
    return undefined;
  };

  const getPlayerAt = (x: number, y: number): boolean => {
    const players = Object.values(gameState.entities).filter(
      (e) => e.type === "PLAYER",
    ) as Player[];
    return players.some((p) => p.position.x === x && p.position.y === y);
  };

  const TILE_SIZE = 48; // px — must match TileRenderer

  // Pest positions for fox overlay
  const pests = Object.values(gameState.entities).filter(
    (e) => e.type === EntityType.PEST,
  );

  return (
    <div className="relative p-4 bg-[#5c8d48] rounded-xl shadow-2xl border-4 border-[#3a5e2a]">
      <div className="flex flex-col shadow-inner bg-black/10">
        {grid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((tile, x) => (
              <TileRenderer
                key={`${x}-${y}`}
                tile={tile}
                plant={getPlantAt(tile.entityId)}
                hasPlayer={getPlayerAt(x, y)}
                isHarvesterOwned={gameState.hasHarvester}
                isAutoSeedsOwned={gameState.hasAutoSeeds}
                isAutoPlowOwned={gameState.hasAutoPlow}
                nextLandCost={gameState.nextLandCost}
                ownedProperties={gameState.ownedProperties}
                selectedSeedType={gameState.selectedSeedType ?? SeedType.WHEAT}
                buffHighlights={buffMap.get(`${x},${y}`) ?? null}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Fox pest overlays — absolutely positioned over the grid */}
      {pests.map((pest) => (
        <div
          key={pest.id}
          className="absolute pointer-events-none z-20 flex items-center justify-center animate-bounce"
          style={{
            left: pest.position.x * TILE_SIZE + 16, // 16px = p-4 padding
            top: pest.position.y * TILE_SIZE + 16,
            width: TILE_SIZE,
            height: TILE_SIZE,
          }}
        >
          <span
            className="text-2xl drop-shadow-lg"
            title="Wild Fox! Walk onto it to scare away."
          >
            🦊
          </span>
        </div>
      ))}
    </div>
  );
};
