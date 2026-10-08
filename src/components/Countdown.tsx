import { msUntilNextDay } from "@/lib/daily";
import { useNow } from "@/hooks/useNow";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Time left until the next challenge unlocks at 00:00 UTC. */
export default function Countdown() {
  const seconds = Math.floor(msUntilNextDay(useNow()) / 1000) % 86_400;
  const text = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <p className="text-[0.6875rem] font-bold tracking-[0.2em] text-muted">NEXT CHALLENGE</p>
      <p role="timer" className="text-2xl font-bold tracking-tight tabular-nums">
        {text}
      </p>
    </div>
  );
}
