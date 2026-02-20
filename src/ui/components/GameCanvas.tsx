import React, { useEffect, useRef, useState } from "react";
import { useGameEngine } from "../hooks/useGameEngine";
import { useInput } from "../hooks/useInput";
import { GridRenderer } from "./GridRenderer";
import { ShopSidebar } from "./ShopSidebar";
import { SeedSelector } from "./SeedSelector";

// Fixed grid dimensions (30 cols × 48px, 15 rows × 48px + 8px padding each side)
const GRID_W = 30 * 48 + 32; // 32 = 16px padding × 2 (from GridRenderer's p-4)
const GRID_H = 15 * 48 + 32;

function useScaledGrid(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const sw = el.clientWidth / GRID_W;
      const sh = el.clientHeight / GRID_H;
      setScale(Math.min(sw, sh, 1)); // never scale UP, only down
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return scale;
}

export const GameCanvas: React.FC = () => {
  const { gameState, dispatch } = useGameEngine();
  useInput(dispatch);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const scale = useScaledGrid(gridContainerRef);

  const dayProgress = gameState.time ? (gameState.time / 5000) * 100 : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* ── Left: Game Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top HUD Bar ─────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-3 px-4 py-2 bg-slate-900 border-b border-white/10 shadow-lg">
          {/* Day + progress bar */}
          <div className="flex flex-col items-center min-w-[48px]">
            <span className="text-[9px] uppercase tracking-wider text-yellow-500 font-bold">
              Day
            </span>
            <span className="text-xl font-bold font-mono leading-tight">
              {gameState.day}
            </span>
            <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                style={{ width: `${dayProgress}%` }}
              />
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/15" />

          {/* Coins */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-yellow-400 font-bold">
              Coins
            </span>
            <span className="text-lg font-bold font-mono text-yellow-300 leading-tight">
              {gameState.inventory?.coins ?? 0}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/15" />

          {/* Tax */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-wider text-red-400 font-bold">
              Tax ({gameState.tax?.daysUntilDue ?? 0}d)
            </span>
            <span className="text-base font-bold font-mono text-red-300 leading-tight">
              -{gameState.tax?.amount ?? 0}
            </span>
          </div>

          <div className="h-8 w-[1px] bg-white/15" />

          {/* Active property badges */}
          <div className="flex gap-1 items-center">
            {gameState.ownedProperties?.greenhouse && (
              <span title="Greenhouse" className="text-base">
                🏡
              </span>
            )}
            {gameState.ownedProperties?.waterTower && (
              <span title="Water Tower" className="text-base">
                💧
              </span>
            )}
            {gameState.ownedProperties?.beehive && (
              <span title="Beehive" className="text-base">
                🐝
              </span>
            )}
            {gameState.ownedProperties?.scarecrow && (
              <span title="Scarecrow" className="text-base">
                🎃
              </span>
            )}
          </div>

          <div className="h-8 w-[1px] bg-white/15" />

          {/* Threat Alerts */}
          <div className="flex gap-2 items-center">
            {gameState.hasActiveBlight && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-900/50 border border-purple-500/30 animate-pulse">
                <span className="text-sm">☠️</span>
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                  Blight Active
                </span>
              </div>
            )}
            {(gameState.pestCount ?? 0) > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-900/50 border border-orange-500/30 animate-pulse">
                <span className="text-sm">🦊</span>
                <span className="text-[10px] font-bold text-orange-300 uppercase tracking-wide">
                  {gameState.pestCount} Fox{gameState.pestCount > 1 ? "es" : ""}
                  !
                </span>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Pause */}
          <button
            onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
              gameState.isPaused
                ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {gameState.isPaused ? "▶ Resume" : "⏸ Pause"}
          </button>

          {/* Save */}
          <button
            onClick={() => {
              if (window.confirm("Save the game?"))
                dispatch({ type: "SAVE_GAME" });
            }}
            className="px-3 py-1.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-bold"
          >
            💾 Save
          </button>
        </div>

        {/* ── Seed Selector Bar ────────────────────────────────────────── */}
        <div className="shrink-0 px-4 py-2 bg-slate-900/60 border-b border-white/5">
          <SeedSelector
            seedBag={gameState.inventory?.seedBag ?? {}}
            selectedSeedType={gameState.selectedSeedType}
            dispatch={dispatch}
          />
        </div>

        {/* ── Grid (dynamically scaled to fit — no scroll) ─────────────── */}
        <div
          ref={gridContainerRef}
          className="flex-1 overflow-hidden flex items-center justify-center"
        >
          <div
            style={{
              width: GRID_W,
              height: GRID_H,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}
          >
            <GridRenderer gameState={gameState} />
          </div>
        </div>

        {/* ── Controls Hint ────────────────────────────────────────────── */}
        <div className="shrink-0 flex gap-4 items-center justify-center text-[10px] text-slate-600 py-1.5 border-t border-white/5">
          <span>
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[10px]">
              WASD
            </kbd>{" "}
            Move
          </span>
          <span className="text-slate-700">|</span>
          <span>
            <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-[10px]">
              Space
            </kbd>{" "}
            Hoe / Plant / Harvest
          </span>
        </div>
      </div>

      {/* ── Right: Shop Sidebar ───────────────────────────────────────── */}
      <div className="shrink-0 w-72 overflow-hidden">
        <ShopSidebar gameState={gameState} dispatch={dispatch} />
      </div>
    </div>
  );
};
