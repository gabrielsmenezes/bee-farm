import { useEffect, useRef, useState } from "react";
import { GameEngine } from "../../core/engine/GameEngine";
import { GameAction, GameEvent, GameState } from "../../core/types";

export const useGameEngine = () => {
  const engineRef = useRef<GameEngine>(new GameEngine());
  const [gameState, setGameState] = useState<GameState>(
    engineRef.current.getState(),
  );

  useEffect(() => {
    const engine = engineRef.current;

    // Subscribe to state changes
    const unsubscribe = engine.eventBus.on<GameState>(
      GameEvent.STATE_CHANGED,
      (newState) => {
        // We might want to throttle this if it causes too many re-renders
        // For now, raw update
        setGameState({ ...newState });
      },
    );

    // Start engine
    engine.start();

    return () => {
      engine.stop();
      unsubscribe();
    };
  }, []);

  const dispatch = (action: GameAction) => {
    engineRef.current.dispatch(action);
  };

  return { gameState, dispatch };
};
