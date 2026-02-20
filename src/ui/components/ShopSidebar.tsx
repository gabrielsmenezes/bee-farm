import React, { useState } from "react";
import {
  GameAction,
  GameState,
  SeedType,
  PropertyType,
  OwnedProperties,
} from "../../core/types";
import { SEED_REGISTRY } from "../../core/seedRegistry";
import { PROPERTY_REGISTRY } from "../../core/propertyRegistry";

interface Props {
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}

type Tab = "seeds" | "upgrades" | "properties";

// ─── Seed Tab ──────────────────────────────────────────────────────────────

const RARITY_BORDER: Record<string, string> = {
  common: "border-slate-600",
  uncommon: "border-green-600",
  rare: "border-purple-600",
  legendary: "border-yellow-500",
};

const RARITY_BADGE: Record<string, string> = {
  common: "bg-slate-700 text-slate-300",
  uncommon: "bg-green-800 text-green-200",
  rare: "bg-purple-800 text-purple-200",
  legendary: "bg-yellow-600 text-yellow-900 font-black",
};

const SeedsTab: React.FC<{
  coins: number;
  seedBag: Record<SeedType, number>;
  selectedSeedType: SeedType;
  shopStock: Partial<Record<SeedType, number>>;
  daysUntilRestock: number;
  dispatch: (action: GameAction) => void;
}> = ({
  coins,
  seedBag,
  selectedSeedType,
  shopStock,
  daysUntilRestock,
  dispatch,
}) => (
  <div className="flex flex-col gap-2">
    {Object.values(SEED_REGISTRY).map((cfg) => {
      const owned = seedBag[cfg.type] ?? 0;
      const isSelected = selectedSeedType === cfg.type;
      const isLimited = cfg.monthlyStock !== undefined;
      const stockLeft = isLimited ? (shopStock[cfg.type] ?? 0) : Infinity;
      const outOfStock = isLimited && stockLeft <= 0;

      return (
        <div
          key={cfg.type}
          className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer
            ${isSelected ? "border-yellow-400 bg-yellow-400/10 ring-1 ring-yellow-400/30" : `${RARITY_BORDER[cfg.rarity]} bg-slate-800/60`}
          `}
          onClick={() => dispatch({ type: "SELECT_SEED", seedType: cfg.type })}
        >
          {/* Rarity badge */}
          <span
            className={`absolute top-2 right-2 text-[9px] uppercase px-1.5 py-0.5 rounded-full ${RARITY_BADGE[cfg.rarity]}`}
          >
            {cfg.rarity}
          </span>

          {/* Top row */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{cfg.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm leading-tight">
                {cfg.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-snug truncate">
                {cfg.description}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-1.5 text-[10px] mb-2.5 flex-wrap">
            <span className="px-1.5 py-0.5 bg-yellow-900/40 text-yellow-400 rounded font-bold">
              💰 {cfg.cost}
            </span>
            <span className="px-1.5 py-0.5 bg-green-900/40 text-green-400 rounded font-bold">
              🌿 {cfg.harvestValue}
            </span>
            <span className="px-1.5 py-0.5 bg-blue-900/40 text-blue-400 rounded font-bold">
              ⏱ {cfg.growthDays}d
            </span>
            <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded font-bold ml-auto">
              Bag: {owned}
            </span>
          </div>

          {/* Monthly stock indicator */}
          {isLimited && (
            <div className="flex items-center gap-1.5 mb-2">
              {outOfStock ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/50 text-red-400 font-bold">
                  ❌ Out of stock — restock in {daysUntilRestock}d
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-400 font-bold">
                  📦 {stockLeft} left this month
                </span>
              )}
            </div>
          )}

          {/* Buy buttons */}
          <div className="flex gap-1.5">
            {[1, 5, 10].map((qty) => {
              const effectiveQty = isLimited ? Math.min(qty, stockLeft) : qty;
              const cost = cfg.cost * effectiveQty;
              const ok = !outOfStock && coins >= cost && effectiveQty > 0;
              return (
                <button
                  key={qty}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (ok)
                      dispatch({
                        type: "BUY_SEED",
                        seedType: cfg.type,
                        quantity: effectiveQty,
                      });
                  }}
                  disabled={!ok}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all
                    ${
                      ok
                        ? "bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                    }`}
                >
                  ×{effectiveQty}
                  <br />
                  <span className="text-[9px] opacity-80">{cost}🪙</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    })}
  </div>
);

// ─── Upgrades Tab ─────────────────────────────────────────────────────────

const UpgradeCard: React.FC<{
  emoji: string;
  name: string;
  description: string;
  cost: number;
  owned: boolean;
  coins: number;
  onBuy: () => void;
  onUse?: () => void;
  useLabel?: string;
  accentColor?: string;
}> = ({
  emoji,
  name,
  description,
  cost,
  owned,
  coins,
  onBuy,
  onUse,
  useLabel,
  accentColor = "#f59e0b",
}) => (
  <div
    className="flex items-center gap-3 p-3 rounded-xl border-2 transition-all"
    style={{
      borderColor: owned ? accentColor : "#374151",
      background: owned ? `${accentColor}15` : "#1e293b99",
    }}
  >
    <div className="text-2xl shrink-0">{emoji}</div>
    <div className="flex-1 min-w-0">
      <div className="font-bold text-white text-sm">{name}</div>
      <div className="text-[10px] text-slate-400 leading-snug">
        {description}
      </div>
      {owned && (
        <div
          className="text-[10px] font-bold mt-0.5"
          style={{ color: accentColor }}
        >
          ✓ Active
        </div>
      )}
    </div>
    <div className="shrink-0 flex flex-col gap-1">
      {!owned ? (
        <button
          onClick={onBuy}
          disabled={coins < cost}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
            ${
              coins >= cost
                ? "bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
        >
          {cost}🪙
        </button>
      ) : onUse ? (
        <button
          onClick={onUse}
          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all active:scale-95 whitespace-nowrap"
        >
          {useLabel ?? "Use"}
        </button>
      ) : null}
    </div>
  </div>
);

const UpgradesTab: React.FC<{
  gameState: GameState;
  dispatch: (action: GameAction) => void;
}> = ({ gameState, dispatch }) => {
  const { hasHarvester, hasAutoSeeds, hasAutoPlow, nextLandCost } = gameState;
  const coins = gameState.inventory?.coins ?? 0;

  return (
    <div className="flex flex-col gap-2">
      {/* Land Expansion */}
      <UpgradeCard
        emoji="🗺️"
        name="Land Expansion"
        description={`Expand your farmable area. Current cost: ${nextLandCost} coins.`}
        cost={nextLandCost ?? 10}
        owned={false}
        coins={coins}
        onBuy={() => dispatch({ type: "BUY_LAND" })}
        accentColor="#60a5fa"
      />

      {/* Harvester */}
      <UpgradeCard
        emoji="🚜"
        name="Auto Harvester"
        description="Automatically harvests all mature plants at the start of each day."
        cost={500}
        owned={hasHarvester}
        coins={coins}
        onBuy={() => dispatch({ type: "BUY_HARVESTER" })}
        onUse={() => dispatch({ type: "USE_HARVESTER" })}
        useLabel="Harvest All"
        accentColor="#f59e0b"
      />

      {/* Auto Seeds */}
      <UpgradeCard
        emoji="🌱"
        name="Auto Seeds"
        description="Automatically buys wheat seeds up to 10 in your bag each day."
        cost={500}
        owned={hasAutoSeeds}
        coins={coins}
        onBuy={() => dispatch({ type: "BUY_AUTO_SEEDS" })}
        accentColor="#22c55e"
      />

      {/* Auto Plow */}
      <UpgradeCard
        emoji="⚙️"
        name="Auto Plow"
        description="Automatically plows 10 grass tiles every day."
        cost={500}
        owned={hasAutoPlow}
        coins={coins}
        onBuy={() => dispatch({ type: "BUY_AUTO_PLOW" })}
        accentColor="#38bdf8"
      />
    </div>
  );
};

// ─── Properties Tab ───────────────────────────────────────────────────────

const PropertiesTab: React.FC<{
  coins: number;
  ownedProperties: OwnedProperties;
  dispatch: (action: GameAction) => void;
}> = ({ coins, ownedProperties, dispatch }) => (
  <div className="flex flex-col gap-2">
    {/* Placement tip */}
    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300">
      <span className="text-sm shrink-0">📍</span>
      <span>
        Move your player to an empty tile, then click{" "}
        <strong>Buy &amp; Place</strong>. Multiple copies can be placed at
        different spots.
      </span>
    </div>

    {Object.values(PROPERTY_REGISTRY).map((cfg) => {
      const owned =
        (cfg.type === PropertyType.GREENHOUSE && ownedProperties.greenhouse) ||
        (cfg.type === PropertyType.WATER_TOWER && ownedProperties.waterTower) ||
        (cfg.type === PropertyType.BEEHIVE && ownedProperties.beehive);

      return (
        <div
          key={cfg.type}
          className="flex items-start gap-3 p-3 rounded-xl border-2 transition-all"
          style={{
            borderColor: owned ? cfg.color : "#374151",
            background: owned ? `${cfg.color}15` : "#1e293b99",
          }}
        >
          <div className="text-2xl shrink-0 mt-0.5">{cfg.emoji}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">{cfg.name}</div>
            <div className="text-[10px] text-slate-400 leading-snug mt-0.5">
              {cfg.description}
            </div>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-slate-700 text-slate-300">
                Radius: {cfg.radius} tile{cfg.radius > 1 ? "s" : ""}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                style={{ background: `${cfg.color}30`, color: cfg.color }}
              >
                {cfg.buffType === "VALUE" &&
                  `+${Math.round((cfg.buffMultiplier - 1) * 100)}% Value`}
                {cfg.buffType === "GROWTH_SPEED" &&
                  `-${Math.round((1 - cfg.buffMultiplier) * 100)}% Growth Time`}
                {cfg.buffType === "SEED_DROP" &&
                  `+${Math.round((cfg.buffMultiplier - 1) * 100)}% Seed Drop`}
              </span>
            </div>
            {owned && (
              <div
                className="text-[10px] font-bold mt-1"
                style={{ color: cfg.color }}
              >
                ✓ Placed on map
              </div>
            )}
          </div>
          <button
            onClick={() =>
              dispatch({ type: "BUY_PROPERTY", propertyType: cfg.type })
            }
            disabled={coins < cfg.cost}
            className={`shrink-0 flex flex-col items-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap
              ${
                coins >= cfg.cost
                  ? "bg-yellow-500 hover:bg-yellow-400 text-black active:scale-95"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
          >
            <span>{cfg.cost}🪙</span>
            <span className="text-[9px] opacity-70 font-normal">Place</span>
          </button>
        </div>
      );
    })}
  </div>
);

// ─── Main ShopSidebar ──────────────────────────────────────────────────────

export const ShopSidebar: React.FC<Props> = ({ gameState, dispatch }) => {
  const [activeTab, setActiveTab] = useState<Tab>("seeds");

  const tabs: Array<{ id: Tab; label: string; emoji: string }> = [
    { id: "seeds", label: "Seeds", emoji: "🌾" },
    { id: "upgrades", label: "Upgrades", emoji: "🚜" },
    { id: "properties", label: "Properties", emoji: "🏡" },
  ];

  return (
    <div className="flex flex-col w-72 h-full bg-slate-900/95 border-l border-white/10 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">🎪</span>
          <span className="font-bold text-white text-base">Shop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <span className="text-yellow-400 text-sm">💰</span>
            <span className="text-yellow-300 font-bold font-mono text-sm">
              {gameState.inventory.coins}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider transition-all
              ${
                activeTab === tab.id
                  ? "text-yellow-400 border-b-2 border-yellow-400 bg-yellow-400/5"
                  : "text-slate-500 hover:text-slate-300"
              }`}
          >
            <span className="text-base leading-none">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === "seeds" && (
          <SeedsTab
            coins={gameState.inventory.coins}
            seedBag={gameState.inventory.seedBag ?? {}}
            selectedSeedType={gameState.selectedSeedType}
            shopStock={gameState.shopStock ?? {}}
            daysUntilRestock={Math.max(
              0,
              28 -
                (gameState.day -
                  (gameState.shopStockResetDay ?? gameState.day)),
            )}
            dispatch={dispatch}
          />
        )}
        {activeTab === "upgrades" && (
          <UpgradesTab gameState={gameState} dispatch={dispatch} />
        )}
        {activeTab === "properties" && (
          <PropertiesTab
            coins={gameState.inventory.coins}
            ownedProperties={gameState.ownedProperties}
            dispatch={dispatch}
          />
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-white/10 text-[9px] text-slate-600 text-center">
        Click a seed to select it → Hoe soil → Plant with Space
      </div>
    </div>
  );
};
