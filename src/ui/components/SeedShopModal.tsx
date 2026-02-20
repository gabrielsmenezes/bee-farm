import React, { useState } from "react";
import { GameAction, SeedType } from "../../core/types";
import { SEED_REGISTRY, SeedConfig } from "../../core/seedRegistry";

interface Props {
  coins: number;
  seedBag: Record<SeedType, number>;
  dispatch: (action: GameAction) => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: "border-slate-500 bg-slate-800/80",
  uncommon: "border-green-500 bg-green-900/40",
  rare: "border-purple-500 bg-purple-900/40",
  legendary: "border-yellow-400 bg-yellow-900/40",
};

const RARITY_BADGE: Record<string, string> = {
  common: "bg-slate-600 text-slate-200",
  uncommon: "bg-green-700 text-green-100",
  rare: "bg-purple-700 text-purple-100",
  legendary: "bg-yellow-500 text-yellow-900",
};

const SeedCard: React.FC<{
  cfg: SeedConfig;
  coins: number;
  owned: number;
  dispatch: (action: GameAction) => void;
}> = ({ cfg, coins, owned, dispatch }) => {
  const [qty, setQty] = useState(1);
  const totalCost = cfg.cost * qty;
  const canAfford = coins >= totalCost;

  return (
    <div
      className={`relative flex flex-col gap-3 p-4 rounded-xl border-2 transition-all ${RARITY_COLORS[cfg.rarity]}`}
    >
      {/* Rarity Badge */}
      <span
        className={`absolute top-2 right-2 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${RARITY_BADGE[cfg.rarity]}`}
      >
        {cfg.rarity}
      </span>

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-4xl drop-shadow-md">{cfg.emoji}</span>
        <div>
          <div className="font-bold text-white text-base leading-tight">
            {cfg.name}
          </div>
          <div className="text-xs text-slate-400 mt-0.5 max-w-[200px]">
            {cfg.description}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-black/30 rounded-lg py-1.5">
          <div className="text-yellow-400 font-bold text-sm">💰 {cfg.cost}</div>
          <div className="text-slate-400 uppercase tracking-wide">Cost</div>
        </div>
        <div className="bg-black/30 rounded-lg py-1.5">
          <div className="text-green-400 font-bold text-sm">
            🌿 {cfg.harvestValue}
          </div>
          <div className="text-slate-400 uppercase tracking-wide">Yield</div>
        </div>
        <div className="bg-black/30 rounded-lg py-1.5">
          <div className="text-blue-400 font-bold text-sm">
            ⏱ {cfg.growthDays}d
          </div>
          <div className="text-slate-400 uppercase tracking-wide">Growth</div>
        </div>
      </div>

      {/* In Inventory */}
      <div className="text-xs text-slate-400">
        In bag: <span className="text-white font-bold">{owned}</span>
      </div>

      {/* Quantity + Buy */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition text-white font-bold text-lg flex items-center justify-center"
        >
          −
        </button>
        <span className="text-white font-mono w-8 text-center font-bold">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition text-white font-bold text-lg flex items-center justify-center"
        >
          +
        </button>

        <button
          onClick={() => {
            if (canAfford) {
              dispatch({ type: "BUY_SEED", seedType: cfg.type, quantity: qty });
            }
          }}
          disabled={!canAfford}
          className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
            canAfford
              ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20 active:scale-95"
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          Buy × {qty} — {totalCost} 🪙
        </button>
      </div>
    </div>
  );
};

export const SeedShopModal: React.FC<Props> = ({
  coins,
  seedBag,
  dispatch,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => dispatch({ type: "CLOSE_SHOP" })}
      />

      {/* Modal */}
      <div className="relative z-10 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎪</span>
            <div>
              <h2 className="text-xl font-bold text-white">Seed Shop</h2>
              <p className="text-xs text-slate-400">
                Choose seeds wisely — each has unique strengths!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
              <span className="text-yellow-400 font-bold text-lg">
                💰 {coins}
              </span>
            </div>
            <button
              onClick={() => dispatch({ type: "CLOSE_SHOP" })}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Seed Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(SEED_REGISTRY).map((cfg) => (
            <SeedCard
              key={cfg.type}
              cfg={cfg}
              coins={coins}
              owned={seedBag[cfg.type] ?? 0}
              dispatch={dispatch}
            />
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-white/10 text-xs text-slate-500 text-center">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">
            Space
          </kbd>{" "}
          or click outside to close
        </div>
      </div>
    </div>
  );
};
