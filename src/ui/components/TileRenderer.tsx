import React from "react";
import { Tile, TileType, PlantStage } from "../../core/types";
import { Plant } from "../../core/entities/Plant";

interface Props {
  tile: Tile;
  plant?: Plant;
  hasPlayer: boolean;
  isHarvesterOwned?: boolean;
  isAutoSeedsOwned?: boolean;
  isAutoPlowOwned?: boolean;
  nextLandCost?: number;
}

// Visual Assets (Inline SVGs for portability)
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

const PlantVisual = ({ stage }: { stage: PlantStage }) => {
  switch (stage) {
    case PlantStage.SEED:
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-stone-800 rounded-full shadow-sm" />
          <div className="w-1.5 h-1.5 bg-stone-600 rounded-full translate-x-1" />
        </div>
      );
    case PlantStage.GROWING:
      return (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center pointer-events-none">
          <svg
            viewBox="0 0 24 24"
            className="w-8 h-8 text-green-500 fill-current animate-bounce-slight"
          >
            <path
              d="M12 20V10M12 10C12 10 9 6 6 8C9 10 12 10 12 10ZM12 10C12 10 15 6 18 8C15 10 12 10 12 10Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      );
    case PlantStage.MATURE:
      return (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-full flex items-end justify-center pointer-events-none">
          {/* Simple Sunflower-ish SVG */}
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-yellow-400 drop-shadow-md"
          >
            <circle cx="12" cy="8" r="4" fill="currentColor" />
            <path d="M12 12V22" stroke="green" strokeWidth="3" />
            <path d="M12 16L8 14" stroke="green" strokeWidth="2" />
            <path d="M12 18L16 16" stroke="green" strokeWidth="2" />
            <circle cx="12" cy="8" r="2" fill="#5d4037" />
            {/* Petals */}
            <path d="M12 2L13 5H11L12 2Z" fill="orange" />
            <path d="M12 14L13 11H11L12 14Z" fill="orange" />
            <path d="M6 8L9 9V7L6 8Z" fill="orange" />
            <path d="M18 8L15 9V7L18 8Z" fill="orange" />
          </svg>
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

const PlayerVisual = () => (
  <div className="absolute inset-0 z-20 flex items-center justify-center -translate-y-2 transition-transform duration-200">
    {/* Simple Character SVG */}
    <div className="relative group">
      {/* Shadow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/30 rounded-full blur-[1px]" />

      <svg viewBox="0 0 32 32" className="w-12 h-12 drop-shadow-lg">
        {/* Body */}
        <rect x="10" y="14" width="12" height="10" rx="2" fill="#3b82f6" />
        {/* Head */}
        <circle cx="16" cy="10" r="5" fill="#fca5a5" />
        {/* Hat */}
        <path d="M8 8H24L20 4H12L8 8Z" fill="#eab308" />
        <rect x="6" y="8" width="20" height="2" rx="1" fill="#ca8a04" />
        {/* Legs */}
        <rect x="11" y="24" width="3" height="6" fill="#1e3a8a" />
        <rect x="18" y="24" width="3" height="6" fill="#1e3a8a" />
        {/* Eyes */}
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
    ></div>
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-yellow-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7zm-4 6h2v-2H3v2zm0 4h2v-2H3v2zM3 7h2V5H3v2z" />
      {/* Simple tractor-like shape or harvesting tool */}
      <path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"
        opacity="0.1"
      />
      <path d="M17 7l-5-4-5 4h10z" fill={isOwned ? "#FBBF24" : "#6B7280"} />{" "}
      {/* Roof */}
      <rect
        x="7"
        y="8"
        width="10"
        height="8"
        fill={isOwned ? "#F59E0B" : "#4B5563"}
      />{" "}
      {/* Body */}
      <circle cx="8" cy="18" r="2" fill="black" /> {/* Wheel */}
      <circle cx="16" cy="18" r="2" fill="black" /> {/* Wheel */}
    </svg>
    {!isOwned && (
      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
        500
      </div>
    )}
  </div>
);

const AutoSeedsVisual = ({ isOwned }: { isOwned: boolean }) => (
  <div className="w-full h-full flex items-center justify-center relative group">
    <div
      className={`absolute inset-0 bg-green-500/20 rounded-lg blur-sm ${isOwned ? "animate-pulse" : ""}`}
    ></div>
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-green-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      {/* Hopper / Funnel */}
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
  <div className="w-full h-full flex items-center justify-center relative group">
    <div
      className={`absolute inset-0 bg-blue-500/20 rounded-lg blur-sm ${isOwned ? "animate-pulse" : ""}`}
    ></div>
    <svg
      viewBox="0 0 24 24"
      className={`w-8 h-8 drop-shadow-lg transition-colors ${isOwned ? "text-blue-500" : "text-gray-500"}`}
      fill="currentColor"
    >
      {/* Plow shape */}
      <path
        d="M4 14h4v-4H4v4zm0 4h4v-4H4v4zM4 10h4V6H4v4zm6 4h10v-4H10v4zm0 4h10v-4H10v4zM10 6v4h10V6H10z"
        opacity="0.5"
      />
      <path d="M17 15l-1.55 1.55c-.53.53-1.4.53-1.93 0l-1.42-1.42c-.53-.53-.53-1.4 0-1.93l1.55-1.55c.53-.53 1.4-.53 1.93 0l1.42 1.42c.53.53.53 1.4 0 1.93z" />
      <path d="M7 17v-8l12 7.74V21H7z" fillOpacity="0.3" />
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

// Basic Tooltip Component (Internal)
const Tooltip = ({ text, subtext }: { text: string; subtext?: string }) => (
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-[100] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-white/10 whitespace-nowrap flex flex-col items-center min-w-[120px] backdrop-blur-sm">
      <span className="font-bold text-yellow-400 mb-1 text-sm">{text}</span>
      {subtext && (
        <span className="text-[10px] text-gray-300 text-center leading-tight max-w-[150px] whitespace-normal">
          {subtext}
        </span>
      )}
      {/* Arrow */}
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900/95 rotate-45 border-r border-b border-white/10"></div>
    </div>
  </div>
);

export const TileRenderer: React.FC<Props> = ({
  tile,
  plant,
  hasPlayer,
  isHarvesterOwned,
  isAutoSeedsOwned,
  isAutoPlowOwned, // Destructure here
  nextLandCost,
}) => {
  const isGrass = tile.type === TileType.GRASS;
  const isSoil = tile.type === TileType.SOIL;
  const isWatered = tile.type === TileType.WATERED_SOIL;
  const isShop = tile.type === TileType.SHOP;
  const isLandOffice = tile.type === TileType.LAND_OFFICE;
  const isHarvester = tile.type === TileType.HARVESTER;
  const isAutoSeeds = tile.type === TileType.AUTO_SEEDS;
  const isAutoPlow = tile.type === TileType.AUTO_PLOW;

  const isFarmable = tile.isFarmable;

  let tooltipText = "";
  let tooltipSubtext = "";

  if (isShop) {
    tooltipText = "Seed Shop";
    tooltipSubtext = "Buy generic seeds for your farm. Cost: 1 Coin.";
  } else if (isLandOffice) {
    tooltipText = "Land Office";
    tooltipSubtext = `Expand your farmable land area. Next Expansion: ${nextLandCost ?? "?"} Coins.`;
  } else if (isHarvester) {
    tooltipText = "Auto Harvester";
    tooltipSubtext = isHarvesterOwned
      ? "Active: Automatically harvests mature plants at start of day."
      : "Automate harvesting! Automatically harvests all fully grown plants. Cost: 500 Coins.";
  } else if (isAutoSeeds) {
    tooltipText = "Auto Seeds";
    tooltipSubtext = isAutoSeedsOwned
      ? "Active: Keeps your seed inventory stocked up to 10."
      : "Automate shopping! Automatically buys seeds when you run low. Cost: 500 Coins.";
  } else if (isAutoPlow) {
    tooltipText = "Auto Plow";
    tooltipSubtext = isAutoPlowOwned
      ? "Active: Automatically plows new soil each day."
      : "Automate farming! Automatically plows 10 grass tiles each day. Cost: 500 Coins.";
  }

  return (
    <div
      className={`
        relative w-12 h-12 shrink-0 group
        ${isGrass && isFarmable ? "bg-[#76bc64]" : ""}
        ${isGrass && !isFarmable ? "bg-[#406836] grayscale-[0.5]" : ""}
        ${isShop ? "bg-[#5c4033]" : ""} 
        ${isLandOffice ? "bg-[#5c4033]" : ""}
        ${isHarvester ? "bg-[#5c4033]" : ""}
        ${isAutoSeeds ? "bg-[#5c4033]" : ""}
        ${isAutoPlow ? "bg-[#5c4033]" : ""}
        transition-colors duration-500
      `}
      // Inline style for strictly grid-based sizing if tailwind is fighting us
      style={{ width: 48, height: 48 }}
    >
      {/* Base Texture */}
      {isGrass && <GrassTexture />}
      {(isSoil || isWatered) && <SoilTexture watered={isWatered} />}
      {isShop && <ShopVisual />}
      {isLandOffice && <LandOfficeVisual />}
      {isHarvester && <HarvesterVisual isOwned={!!isHarvesterOwned} />}
      {isAutoSeeds && <AutoSeedsVisual isOwned={!!isAutoSeedsOwned} />}
      {isAutoPlow && <AutoPlowVisual isOwned={!!isAutoPlowOwned} />}

      {/* Grid Border (Subtle) */}
      <div className="absolute inset-0 border-[0.5px] border-black/5 pointer-events-none" />

      {/* Plant Layer */}
      {plant && <PlantVisual stage={plant.stage} />}

      {/* Player Layer */}
      {hasPlayer && <PlayerVisual />}

      {/* Tooltip */}
      {tooltipText && <Tooltip text={tooltipText} subtext={tooltipSubtext} />}

      {/* Interaction Highlight (Hover logic could go here) */}
    </div>
  );
};
