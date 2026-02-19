import React from "react";
import { GameState } from "../../core/types";
import { TileRenderer } from "./TileRenderer";
import { Plant } from "../../core/entities/Plant";
import { Player } from "../../core/entities/Player";

interface Props {
  gameState: GameState;
}

export const GridRenderer: React.FC<Props> = ({ gameState }) => {
  const { grid } = gameState;

  // Optimally we should map this once per render, but for 20x20 it's fine.
  const getPlantAt = (
    entityId: string | null | undefined,
  ): Plant | undefined => {
    if (!entityId) return undefined;
    const entity = gameState.entities[entityId];
    if (entity && entity.type === "PLANT") return entity as Plant;
    return undefined;
  };

  const getPlayerAt = (x: number, y: number): boolean => {
    // Player might not be linked in grid (moving freely?), but for now grid-based.
    const players = Object.values(gameState.entities).filter(
      (e) => e.type === "PLAYER",
    ) as Player[];
    return players.some((p) => p.position.x === x && p.position.y === y);
  };

  return (
    <div className="relative p-4 bg-[#5c8d48] rounded-xl shadow-2xl border-4 border-[#3a5e2a]">
      {/* Outer Grid Container */}
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
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
