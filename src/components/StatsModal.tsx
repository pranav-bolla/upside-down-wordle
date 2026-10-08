import { ArrowUpRight } from "lucide-react";
import { MAX_SCORE } from "@/lib/config";
import { isComplete, type GameState } from "@/lib/game";
import { totalScore } from "@/lib/scoring";
import { buildShareText } from "@/lib/share";
import { averageScore, liveStreak, type Stats } from "@/lib/stats";
import Countdown from "./Countdown";
import Modal from "./Modal";
import ShareButton from "./ShareButton";

interface StatsModalProps {
  stats: Stats;
  game: GameState;
  today: number;
  onClose: () => void;
}

export default function StatsModal({ stats, game, today, onClose }: StatsModalProps) {
  const done = isComplete(game);
  const tiles = [
    { label: "Played", value: stats.played },
    { label: "Current streak", value: liveStreak(stats, today) },
    { label: "Longest streak", value: stats.longestStreak },
    { label: "Average score", value: averageScore(stats) },
  ];

  return (
    <Modal title="Statistics" onClose={onClose}>
      <dl className="grid grid-cols-2 gap-2.5">
        {tiles.map(({ label, value }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface px-4 py-4">
            <dd className="text-4xl leading-none font-extrabold tracking-tight tabular-nums">
              {value}
            </dd>
            <dt className="mt-2 text-xs font-medium text-muted">{label}</dt>
          </div>
        ))}
        <div className="col-span-2 flex items-center justify-between rounded-2xl bg-accent px-5 py-4 text-white">
          <dt className="text-sm font-semibold">
            Perfect {MAX_SCORE}s
            <span className="block text-xs font-normal text-white/75">
              Days you read all three words correctly.
            </span>
          </dt>
          <dd className="text-4xl leading-none font-extrabold tracking-tight tabular-nums">
            {stats.perfects}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col items-center gap-5">
        {done ? (
          <>
            <p className="text-sm text-muted">
              Today: <span className="font-semibold text-ink">{totalScore(game.rounds)}</span> /{" "}
              {MAX_SCORE}
            </p>
            <ShareButton variant="primary" getText={() => buildShareText(game)}>
              SHARE RESULTS
              <ArrowUpRight size={19} strokeWidth={2.75} />
            </ShareButton>
          </>
        ) : (
          <p className="text-center text-sm text-muted">
            {stats.played === 0
              ? "No data yet. The words are waiting."
              : "Today’s words remain unread."}
          </p>
        )}
        <Countdown />
      </div>
    </Modal>
  );
}
