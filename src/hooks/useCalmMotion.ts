import { createContext, useContext } from "react";

/** True when the player (or their OS) has asked for less animation. */
export const CalmMotionContext = createContext(false);

export function useCalmMotion(): boolean {
  return useContext(CalmMotionContext);
}
