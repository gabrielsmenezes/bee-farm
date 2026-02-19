import React from "react";
import { useGameEngine } from "../hooks/useGameEngine";
import { useInput } from "../hooks/useInput";
import { GridRenderer } from "./GridRenderer";

export const GameCanvas: React.FC = () => {
  const { gameState, dispatch } = useGameEngine();

  // Attach input listeners
  useInput(dispatch);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white font-sans relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="smallGrid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#smallGrid)" />
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center">
        {/* HUD */}
        <div className="mb-8 flex items-center gap-6 px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-yellow-500 font-bold">
              Day
            </span>
            <span className="text-3xl font-bold font-mono">
              {gameState.day}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-yellow-400 font-bold">
                Coins
              </span>
              <span className="text-2xl font-bold font-mono text-yellow-300">
                {gameState.inventory?.coins ?? 0}
              </span>
            </div>

            <div className="h-10 w-[1px] bg-white/20"></div>

            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wider text-green-400 font-bold">
                Seeds
              </span>
              <span className="text-2xl font-bold font-mono text-green-300">
                {gameState.inventory?.seeds ?? 0}
              </span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-blue-300 font-bold">
              Land Cost
            </span>
            <span className="text-xl font-bold font-mono text-blue-200">
              {gameState.nextLandCost ?? 10}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-red-300 font-bold">
              Tax ({gameState.tax?.daysUntilDue ?? 0}d)
            </span>
            <span className="text-xl font-bold font-mono text-red-200">
              -{gameState.tax?.amount ?? 0}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
              className={`p-2 rounded-full transition-all ${
                gameState.isPaused
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 ring-2 ring-green-500/50"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {gameState.isPaused ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </button>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mt-1">
              {gameState.isPaused ? "RESUME" : "PAUSE"}
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex flex-col items-center">
            <button
              onClick={() => {
                if (window.confirm("Do you want to save the game?")) {
                  dispatch({ type: "SAVE_GAME" });
                }
              }}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </button>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-bold mt-1">
              SAVE
            </span>
          </div>

          <div className="h-10 w-[1px] bg-white/20"></div>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-white/70 font-bold">
              Tool
            </span>
            {/* Dynamically visually show tool... for now just icon */}
            <div className="text-xl">🪓</div>
          </div>
        </div>

        {/* Game View */}
        <GridRenderer gameState={gameState} />

        {/* Controls Hint */}
        <div className="mt-8 flex gap-4 text-sm text-slate-400 bg-black/50 px-4 py-2 rounded-full">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-mono">
              WASD
            </span>
            <span>Move</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-600"></div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-slate-700 rounded text-xs font-mono">
              SPACE
            </span>
            <span>Interact</span>
          </div>
        </div>
      </div>
    </div>
  );
};
