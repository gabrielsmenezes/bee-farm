import { useEffect } from "react";
import { GameAction } from "../../core/types";

export const useInput = (dispatch: (action: GameAction) => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If focus is inside an input/textarea, don't intercept
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          e.preventDefault();
          dispatch({ type: "MOVE_PLAYER", direction: { x: 0, y: -1 } });
          break;
        case "s":
        case "arrowdown":
          e.preventDefault();
          dispatch({ type: "MOVE_PLAYER", direction: { x: 0, y: 1 } });
          break;
        case "a":
        case "arrowleft":
          e.preventDefault();
          dispatch({ type: "MOVE_PLAYER", direction: { x: -1, y: 0 } });
          break;
        case "d":
        case "arrowright":
          e.preventDefault();
          dispatch({ type: "MOVE_PLAYER", direction: { x: 1, y: 0 } });
          break;
        case " ": // Space
        case "enter":
          // Prevent the browser from clicking the currently-focused sidebar button
          e.preventDefault();
          // Also blur any focused element (e.g. a shop button) so it doesn't receive the click
          (document.activeElement as HTMLElement)?.blur();
          dispatch({ type: "INTERACT" });
          break;
      }

    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch]);
};
