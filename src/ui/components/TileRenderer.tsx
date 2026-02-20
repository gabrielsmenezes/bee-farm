import React from "react";
import { Tile, TileType, PlantStage, SeedType } from "../../core/types";
import { Plant } from "../../core/entities/Plant";
import { OwnedProperties } from "../../core/types";
import { PROPERTY_REGISTRY } from "../../core/propertyRegistry";
import { PropertyType } from "../../core/types";

import { BuffHighlight } from "./GridRenderer";

interface Props {
  tile: Tile;
  plant?: Plant;
  hasPlayer: boolean;
  isHarvesterOwned?: boolean;
  isAutoSeedsOwned?: boolean;
  isAutoPlowOwned?: boolean;
  nextLandCost?: number;
  ownedProperties?: OwnedProperties;
  selectedSeedType?: SeedType;
  buffHighlights?: BuffHighlight[] | null;
}

// ─── Terrain Textures ──────────────────────────────────────────────────────

const GrassTexture = () => (
  <svg
    className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
    viewBox="0 0 100 100"
  >
    <path
      d="M10 90 Q 15 80 20 90"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M30 85 Q 35 75 40 85"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M60 88 Q 65 78 70 88"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M80 82 Q 85 72 90 82"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M50 50 Q 55 40 60 50"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

const SoilTexture = ({ watered }: { watered: boolean }) => (
  <div
    className={`absolute inset-0 w-full h-full ${watered ? "bg-amber-900" : "bg-amber-700"}`}
  >
    <svg
      className="absolute inset-0 w-full h-full opacity-20"
      viewBox="0 0 100 100"
    >
      <circle cx="20" cy="20" r="2" fill="currentColor" />
      <circle cx="60" cy="50" r="3" fill="currentColor" />
      <circle cx="80" cy="80" r="2" fill="currentColor" />
      <circle cx="30" cy="70" r="2" fill="currentColor" />
    </svg>
  </div>
);

// ─── Plant Visuals ─────────────────────────────────────────────────────────

const SEED_VISUALS: Record<
  SeedType,
  { seedColor: string; stemColor: string; flowerColor: string; emoji: string }
> = {
  [SeedType.WHEAT]: {
    seedColor: "#a16207",
    stemColor: "#65a30d",
    flowerColor: "#fbbf24",
    emoji: "🌾",
  },
  [SeedType.SUNFLOWER]: {
    seedColor: "#92400e",
    stemColor: "#16a34a",
    flowerColor: "#eab308",
    emoji: "🌻",
  },
  [SeedType.MUSHROOM]: {
    seedColor: "#57534e",
    stemColor: "#f5f5f4",
    flowerColor: "#dc2626",
    emoji: "🍄",
  },
  [SeedType.BLUEBERRY]: {
    seedColor: "#1e1b4b",
    stemColor: "#15803d",
    flowerColor: "#7c3aed",
    emoji: "🫐",
  },
  [SeedType.POISON_IVY]: {
    seedColor: "#166534",
    stemColor: "#4d7c0f",
    flowerColor: "#15803d",
    emoji: "☠️",
  },
  [SeedType.GOLDEN_SEED]: {
    seedColor: "#78350f",
    stemColor: "#a16207",
    flowerColor: "#fbbf24",
    emoji: "✨",
  },
};

const PlantVisual = ({
  stage,
  seedType,
}: {
  stage: PlantStage;
  seedType: SeedType;
}) => {
  const v = SEED_VISUALS[seedType] ?? SEED_VISUALS[SeedType.WHEAT];

  switch (stage) {
    case PlantStage.SEED:
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            style={{ background: v.seedColor }}
            className="w-2 h-2 rounded-full shadow-sm"
          />
          <div
            style={{ background: v.stemColor }}
            className="w-1 h-1 rounded-full translate-x-1 opacity-70"
          />
        </div>
      );
    case PlantStage.GROWING:
      return (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center pointer-events-none">
          <div
            className="text-2xl animate-bounce"
            style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.4))" }}
          >
            {v.emoji}
          </div>
        </div>
      );
    case PlantStage.MATURE:
      return (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center pointer-events-none">
          <div
            className="text-3xl drop-shadow-lg"
            style={{
              filter: `drop-shadow(0 0 6px ${v.flowerColor}88) drop-shadow(0 2px 2px rgba(0,0,0,0.4))`,
            }}
          >
            {v.emoji}
          </div>
        </div>
      );
    case PlantStage.DEAD:
      return (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-stone-600">
            <path d="M12 20V12" stroke="currentColor" strokeWidth="2" />
            <path d="M12 12L9 15" stroke="currentColor" strokeWidth="2" />
            <path d="M12 12L15 14" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
      );
    default:
      return null;
  }
};

// ─── Building Visuals ──────────────────────────────────────────────────────

const PlayerVisual = () => (
  <div className="absolute inset-0 z-20 flex items-center justify-center -translate-y-2 transition-transform duration-200">
    <div className="relative group">
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/30 rounded-full blur-[1px]" />
      <svg viewBox="0 0 32 32" className="w-12 h-12 drop-shadow-lg">
        <rect x="10" y="14" width="12" height="10" rx="2" fill="#3b82f6" />
        <circle cx="16" cy="10" r="5" fill="#fca5a5" />
        <path d="M8 8H24L20 4H12L8 8Z" fill="#eab308" />
        <rect x="6" y="8" width="20" height="2" rx="1" fill="#ca8a04" />
        <rect x="11" y="24" width="3" height="6" fill="#1e3a8a" />
        <rect x="18" y="24" width="3" height="6" fill="#1e3a8a" />
        <circle cx="14" cy="10" r="1" fill="black" />
        <circle cx="18" cy="10" r="1" fill="black" />
      </svg>
    </div>
  </div>
);

const ShopVisual = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center">
    <div className="w-10 h-10 bg-red-700 rounded-lg shadow-lg border-2 border-yellow-500 flex items-center justify-center relative">
      <div className="text-2xl">🎪</div>
      <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] font-bold px-1 rounded-full border border-black">
        SHOP
      </div>
    </div>
  </div>
);

const LandOfficeVisual = () => (
  <div className="absolute inset-0 z-10 flex items-center justify-center">
    <div className="w-10 h-10 bg-blue-700 rounded-lg shadow-lg border-2 border-white flex items-center justify-center relative">
      <div className="text-2xl">🏠</div>
      <div className="absolute -top-2 -right-2 bg-blue-400 text-white text-[8px] font-bold px-1 rounded-full border border-white">
        LAND
      </div>
    </div>
  </div>
);

const HarvesterVisual = ({ isOwned }: { isOwned: boolean }) => (
  <div className="w-full h-full flex items-center justify-center relative group">
    <div
      className={`absolute inset-0 bg-yellow-500/20 rounded-lg blur-sm ${isOwned ? "animate-pulse" : ""}`}
    />
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-yellow-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      <path d="M17 7l-5-4-5 4h10z" fill={isOwned ? "#FBBF24" : "#6B7280"} />
      <rect
        x="7"
        y="8"
        width="10"
        height="8"
        fill={isOwned ? "#F59E0B" : "#4B5563"}
      />
      <circle cx="8" cy="18" r="2" fill="black" />
      <circle cx="16" cy="18" r="2" fill="black" />
    </svg>
    {!isOwned && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        500
      </div>
    )}
  </div>
);

const AutoSeedsVisual = ({ isOwned }: { isOwned: boolean }) => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div
      className={`absolute inset-0 bg-green-500/20 rounded-lg blur-sm ${isOwned ? "animate-pulse" : ""}`}
    />
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-green-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      <path d="M20 4H4v2h16V4zm1 2h-2v2h2V6zm-2 2H5v2h14V8zM5 8H3v2h2V8zm0 2h14v2H5v-2zm0 2h14l-2 6H7l-2-6z" />
      <circle cx="12" cy="18" r="2" fill={isOwned ? "#34D399" : "#6B7280"} />
    </svg>
    {!isOwned && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        500
      </div>
    )}
    {isOwned && (
      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-full shadow-sm">
        AUTO
      </div>
    )}
  </div>
);

const AutoPlowVisual = ({ isOwned }: { isOwned: boolean }) => (
  <div className="w-full h-full flex items-center justify-center relative">
    <div
      className={`absolute inset-0 bg-blue-500/20 rounded-lg blur-sm ${isOwned ? "animate-pulse" : ""}`}
    />
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-blue-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      <path
        d="M4 14h4v-4H4v4zm0 4h4v-4H4v4zM4 10h4V6H4v4zm6 4h10v-4H10v4zm0 4h10v-4H10v4zM10 6v4h10V6H10z"
        opacity="0.5"
      />
      <path d="M17 15l-1.55 1.55c-.53.53-1.4.53-1.93 0l-1.42-1.42c-.53-.53-.53-1.4 0-1.93l1.55-1.55c.53-.53 1.4-.53 1.93 0l1.42 1.42c.53.53.53 1.4 0 1.93z" />
    </svg>
    {!isOwned && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        500
      </div>
    )}
    {isOwned && (
      <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] font-bold px-1 rounded-full shadow-sm">
        PLOW
      </div>
    )}
  </div>
);

// ─── Property Building Visuals ─────────────────────────────────────────────

const PropertyVisual = ({
  propType,
  isOwned,
}: {
  propType: PropertyType;
  isOwned: boolean;
}) => {
  const cfg = PROPERTY_REGISTRY[propType];
  return (
    <div className="w-full h-full flex items-center justify-center relative group">
      {/* Glow when owned */}
      {isOwned && (
        <div
          className="absolute inset-0 rounded-lg blur-sm animate-pulse"
          style={{ background: `${cfg.color}40` }}
        />
      )}
      <div
        className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 shadow-lg transition-all
          ${isOwned ? "border-opacity-100" : "border-slate-600"}`}
        style={{
          background: isOwned ? `${cfg.color}30` : "#2d3748",
          borderColor: isOwned ? cfg.color : undefined,
        }}
      >
        <span className="text-xl leading-none">{cfg.emoji}</span>
        {isOwned && (
          <div
            className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full border border-black flex items-center justify-center text-[6px] font-bold"
            style={{ background: cfg.color, color: "#000" }}
          >
            ✓
          </div>
        )}
      </div>
      {!isOwned && (
        <div
          className="absolute -top-2 -right-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
          style={{ background: cfg.color }}
        >
          {cfg.cost}
        </div>
      )}
    </div>
  );
};

// ─── Tooltip ───────────────────────────────────────────────────────────────

const Tooltip = ({ text, subtext }: { text: string; subtext?: string }) => (
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap flex flex-col items-center min-w-[120px] backdrop-blur-sm">
      <span className="font-bold text-yellow-400 mb-1 text-sm">{text}</span>
      {subtext && (
        <span className="text-[10px] text-gray-300 text-center leading-tight max-w-[150px] whitespace-normal">
          {subtext}
        </span>
      )}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/10" />
    </div>
  </div>
);

// ─── Main TileRenderer ─────────────────────────────────────────────────────

export const TileRenderer: React.FC<Props> = ({
  tile,
  plant,
  hasPlayer,
  isHarvesterOwned,
  isAutoSeedsOwned,
  isAutoPlowOwned,
  nextLandCost,
  ownedProperties,
  selectedSeedType: _selectedSeedType,
  buffHighlights,
}) => {
  const isGrass = tile.type === TileType.GRASS;
  const isSoil = tile.type === TileType.SOIL;
  const isWatered = tile.type === TileType.WATERED_SOIL;
  const isBlighted = tile.type === TileType.BLIGHTED;
  const isShop = tile.type === TileType.SHOP;
  const isLandOffice = tile.type === TileType.LAND_OFFICE;
  const isHarvester = tile.type === TileType.HARVESTER;
  const isAutoSeeds = tile.type === TileType.AUTO_SEEDS;
  const isAutoPlow = tile.type === TileType.AUTO_PLOW;
  const isGreenhouse = tile.type === TileType.GREENHOUSE;
  const isWaterTower = tile.type === TileType.WATER_TOWER;
  const isBeehive = tile.type === TileType.BEEHIVE;
  const isScarecrow = tile.type === TileType.SCARECROW;

  const isFarmable = tile.isFarmable;
  const isBuilding =
    isShop ||
    isLandOffice ||
    isHarvester ||
    isAutoSeeds ||
    isAutoPlow ||
    isGreenhouse ||
    isWaterTower ||
    isBeehive ||
    isScarecrow;

  let tooltipText = "";
  let tooltipSubtext = "";

  if (isShop) {
    tooltipText = "Seed Shop";
    tooltipSubtext = "Press Space to browse and buy all seed types!";
  } else if (isLandOffice) {
    tooltipText = "Land Office";
    tooltipSubtext = `Expand your farmable land. Next: ${nextLandCost ?? "?"} Coins.`;
  } else if (isHarvester) {
    tooltipText = "Auto Harvester";
    tooltipSubtext = isHarvesterOwned
      ? "Active: Harvests all mature plants each day."
      : "Automates harvesting mature plants. Cost: 500 Coins.";
  } else if (isAutoSeeds) {
    tooltipText = "Auto Seeds";
    tooltipSubtext = isAutoSeedsOwned
      ? "Active: Keeps wheat seeds stocked up to 10."
      : "Auto-buys wheat seeds daily. Cost: 500 Coins.";
  } else if (isAutoPlow) {
    tooltipText = "Auto Plow";
    tooltipSubtext = isAutoPlowOwned
      ? "Active: Plows 10 tiles each day."
      : "Auto-plows 10 grass tiles daily. Cost: 500 Coins.";
  } else if (isGreenhouse) {
    const cfg = PROPERTY_REGISTRY[PropertyType.GREENHOUSE];
    tooltipText = cfg.name;
    tooltipSubtext = ownedProperties?.greenhouse
      ? `Active: ${cfg.description}`
      : `${cfg.description} Cost: ${cfg.cost} Coins.`;
  } else if (isWaterTower) {
    const cfg = PROPERTY_REGISTRY[PropertyType.WATER_TOWER];
    tooltipText = cfg.name;
    tooltipSubtext = ownedProperties?.waterTower
      ? `Active: ${cfg.description}`
      : `${cfg.description} Cost: ${cfg.cost} Coins.`;
  } else if (isBeehive) {
    const cfg = PROPERTY_REGISTRY[PropertyType.BEEHIVE];
    tooltipText = cfg.name;
    tooltipSubtext = ownedProperties?.beehive
      ? `Active: ${cfg.description}`
      : `${cfg.description} Cost: ${cfg.cost} Coins.`;
  } else if (isScarecrow) {
    const cfg = PROPERTY_REGISTRY[PropertyType.SCARECROW];
    tooltipText = cfg.name;
    tooltipSubtext = ownedProperties?.scarecrow
      ? `Active: ${cfg.description}`
      : `${cfg.description} Cost: ${cfg.cost} Coins.`;
  } else if (isBlighted) {
    tooltipText = "⚠️ Blighted Soil";
    tooltipSubtext =
      "Blight! Plants die here. Walk here + Space to clear (8🪙) or use Pesticide.";
  }

  return (
    <div
      className={`
        relative w-12 h-12 shrink-0 group
        ${isGrass && isFarmable ? "bg-[#76bc64]" : ""}
        ${isGrass && !isFarmable ? "bg-[#406836] grayscale-[0.5]" : ""}
        ${isBlighted ? "bg-purple-950" : ""}
        ${isBuilding ? "bg-[#5c4033]" : ""}
        transition-colors duration-500
      `}
      style={{ width: 48, height: 48 }}
    >
      {/* Base Texture */}
      {isGrass && <GrassTexture />}
      {(isSoil || isWatered) && <SoilTexture watered={isWatered} />}
      {isBlighted && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="absolute inset-0 bg-purple-900/60" />
          <svg
            className="absolute inset-0 w-full h-full opacity-30"
            viewBox="0 0 48 48"
          >
            {/* cracked ground lines */}
            <polyline
              points="8,40 16,28 12,20"
              stroke="#a855f7"
              strokeWidth="1.5"
              fill="none"
            />
            <polyline
              points="24,44 28,32 36,24"
              stroke="#a855f7"
              strokeWidth="1.5"
              fill="none"
            />
            <polyline
              points="4,24 14,32 10,38"
              stroke="#7c3aed"
              strokeWidth="1"
              fill="none"
            />
          </svg>
          <span className="text-lg z-10 drop-shadow-lg">☠️</span>
        </div>
      )}

      {/* Building Visuals */}
      {isShop && <ShopVisual />}
      {isLandOffice && <LandOfficeVisual />}
      {isHarvester && <HarvesterVisual isOwned={!!isHarvesterOwned} />}
      {isAutoSeeds && <AutoSeedsVisual isOwned={!!isAutoSeedsOwned} />}
      {isAutoPlow && <AutoPlowVisual isOwned={!!isAutoPlowOwned} />}
      {isGreenhouse && (
        <PropertyVisual
          propType={PropertyType.GREENHOUSE}
          isOwned={!!ownedProperties?.greenhouse}
        />
      )}
      {isWaterTower && (
        <PropertyVisual
          propType={PropertyType.WATER_TOWER}
          isOwned={!!ownedProperties?.waterTower}
        />
      )}
      {isBeehive && (
        <PropertyVisual
          propType={PropertyType.BEEHIVE}
          isOwned={!!ownedProperties?.beehive}
        />
      )}
      {isScarecrow && (
        <PropertyVisual
          propType={PropertyType.SCARECROW}
          isOwned={!!ownedProperties?.scarecrow}
        />
      )}

      {/* Grid Border */}
      <div className="absolute inset-0 border-[0.5px] border-black/5 pointer-events-none" />

      {/* Buff Radius Highlights — one ring per affecting property, different inset per layer */}
      {buffHighlights?.map(({ color, borderStyle }, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            inset: i * 3,
            border: `2px ${borderStyle} ${color}bb`,
            background: i === 0 ? `${color}0e` : "transparent",
          }}
        />
      ))}

      {/* Plant Layer */}
      {plant && (
        <PlantVisual
          stage={plant.stage}
          seedType={plant.seedType ?? SeedType.WHEAT}
        />
      )}

      {/* Player Layer */}
      {hasPlayer && <PlayerVisual />}

      {/* Tooltip */}
      {tooltipText && <Tooltip text={tooltipText} subtext={tooltipSubtext} />}
    </div>
  );
};
