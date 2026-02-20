import React from "react";
import { GameAction, SeedType } from "../../core/types";
import { SEED_REGISTRY } from "../../core/seedRegistry";

interface Props {
  seedBag: Record<SeedType, number>;
  selectedSeedType: SeedType;
  dispatch: (action: GameAction) => void;
}

export const SeedSelector: React.FC<Props> = ({
  seedBag = {} as Record<SeedType, number>,
  selectedSeedType,
  dispatch,
}) => {
  const seeds = Object.values(SEED_REGISTRY);

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur rounded-2xl border border-white/10">
      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold mr-1">
        Seed
      </span>
      {seeds.map((cfg) => {
        const count = seedBag[cfg.type] ?? 0;
        const isSelected = selectedSeedType === cfg.type;
        return (
          <button
            key={cfg.type}
            onClick={() =>
              dispatch({ type: "SELECT_SEED", seedType: cfg.type })
            }
            title={`${cfg.name} (${count} in bag)`}
            className={`relative flex flex-col items-center justify-center w-11 h-11 rounded-xl text-xl transition-all border-2
              ${
                isSelected
                  ? "border-yellow-400 bg-yellow-400/20 scale-110 shadow-lg shadow-yellow-400/20"
                  : count > 0
                    ? "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40"
                    : "border-white/5 bg-white/5 opacity-40 cursor-default"
              }
            `}
          >
            <span className="leading-none">{cfg.emoji}</span>
            <span
              className={`text-[9px] font-bold leading-none mt-0.5 ${
                count > 0 ? "text-white" : "text-slate-600"
              }`}
            >
              {count}
            </span>
            {isSelected && (
              <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full border border-black" />
            )}
          </button>
        );
      })}
    </div>
  );
};
