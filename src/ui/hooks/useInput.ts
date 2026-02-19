import { useEffect } from "react";
import { GameAction } from "../../core/types";

export const useInput = (dispatch: (action: GameAction) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          dispatch({ type: "MOVE_PLAYER", direction: { x: 0, y: -1 } });
          break;
        case "s":
        case "arrowdown":
          dispatch({ type: "MOVE_PLAYER", direction: { x: 0, y: 1 } });
          break;
        case "a":
        case "arrowleft":
          dispatch({ type: "MOVE_PLAYER", direction: { x: -1, y: 0 } });
          break;
        case "d":
        case "arrowright":
          dispatch({ type: "MOVE_PLAYER", direction: { x: 1, y: 0 } });
          break;
        case " ": // Space
        case "enter":
          dispatch({ type: "INTERACT" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);
};
