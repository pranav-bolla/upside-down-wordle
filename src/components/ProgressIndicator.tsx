import { motion } from "framer-motion";
import type { RoundState } from "@/lib/game";

interface ProgressIndicatorProps {
  rounds: RoundState[];
  /** Round currently on screen. */
  current: number;
}

function colorFor(round: RoundState, isCurrent: boolean): string {
  if (round.status === "won") return "bg-good";
  if (round.status === "lost") return "bg-bad";
  return isCurrent ? "bg-accent" : "bg-track";
}

export default function ProgressIndicator({ rounds, current }: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-bold tracking-[0.2em] text-ink">
        WORD {current + 1} OF {rounds.length}
      </p>
      <div aria-hidden className="flex items-center gap-1.5">
        {rounds.map((round, index) => (
          <motion.span
            key={index}
            className={`h-1.5 rounded-full transition-colors duration-300 ${colorFor(round, index === current)}`}
            initial={false}
            animate={{ width: index === current ? 36 : 14 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          />
        ))}
      </div>
    </div>
  );
}
