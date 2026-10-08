import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Swords } from "lucide-react";
import { MAX_GUESSES, MAX_SCORE } from "@/lib/config";
import { formatDayNumber } from "@/lib/daily";
import type { GameState, RoundState } from "@/lib/game";
import { ratingFor, roundPoints, totalScore } from "@/lib/scoring";
import { buildChallengeText, buildShareText } from "@/lib/share";
import { useCalmMotion } from "@/hooks/useCalmMotion";
import Confetti from "./Confetti";
import Countdown from "./Countdown";
import ShareButton from "./ShareButton";

interface ResultsScreenProps {
  game: GameState;
  /** Set once the UTC day has rolled over and a new challenge is waiting. */
  nextDay: number | null;
  onPlayNext: () => void;
}

function useCountUp(target: number, calm: boolean): number {
  const [value, setValue] = useState(calm ? target : 0);
  useEffect(() => {
    if (calm) return;
    const controls = animate(0, target, {
      duration: 1.1,
      delay: 0.25,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [target, calm]);
  return calm ? target : value;
}

function chipColor(round: RoundState): string {
  if (round.status !== "won") return "bg-bad";
  const used = round.guesses.length;
  if (used === 1) return "bg-good";
  return used <= 3 ? "bg-[#f5b83d]" : "bg-[#f08c3a]";
}

const rise = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: "easeOut" as const } },
};

export default function ResultsScreen({ game, nextDay, onPlayNext }: ResultsScreenProps) {
  const calm = useCalmMotion();
  const score = totalScore(game.rounds);
  const shown = useCountUp(score, calm);

  return (
    <motion.section
      aria-label="Results"
      className="flex w-full flex-col items-center gap-7 text-center"
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.07 }}
    >
      {score === MAX_SCORE && !calm && <Confetti />}

      <motion.div variants={rise} className="flex flex-col gap-2">
        <h2 className="text-[1.75rem] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-4xl">
          Congratulations. You read three words.
        </h2>
        <p className="text-muted">An extraordinary achievement.</p>
      </motion.div>

      <motion.div
        variants={rise}
        className="w-full rounded-[2rem] border border-line bg-surface px-6 py-7 shadow-[0_1px_2px_rgba(32,32,32,0.04),0_12px_32px_-12px_rgba(32,32,32,0.12)]"
      >
        <p
          className="text-6xl leading-none font-extrabold tracking-tighter tabular-nums sm:text-7xl"
          aria-label={`${score} out of ${MAX_SCORE}`}
        >
          <span className="text-accent-ink">{shown}</span>
          <span className="text-ink/25"> / {MAX_SCORE}</span>
        </p>
        <p className="mt-3 text-lg font-bold">{ratingFor(score)}</p>
        <p className="mt-1 text-sm text-muted">
          Your reading skills have been officially verified.
        </p>

        <ul className="mt-6 flex flex-col gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
          {game.rounds.map((round, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-3 bg-paper/60 px-4 py-3"
            >
              <span className="flex items-center gap-2.5 font-bold tracking-[0.12em]">
                <span aria-hidden className={`size-3 rounded-[4px] ${chipColor(round)}`} />
                WORD {index + 1}
              </span>
              <span className="text-muted tabular-nums">
                {round.status === "won"
                  ? `${round.guesses.length}/${MAX_GUESSES} guesses`
                  : "not read"}
                <span className="ml-3 inline-block w-9 text-right font-semibold text-ink">
                  +{roundPoints(round)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div variants={rise} className="flex w-full flex-col gap-3.5">
        <ShareButton variant="primary" getText={() => buildShareText(game)}>
          SHARE RESULTS
          <ArrowUpRight size={19} strokeWidth={2.75} />
        </ShareButton>
        <ShareButton variant="secondary" getText={() => buildChallengeText(game)}>
          <Swords size={17} strokeWidth={2.25} />
          CHALLENGE A FRIEND
        </ShareButton>
      </motion.div>

      <motion.div variants={rise} className="flex w-full flex-col items-center gap-4 pb-2">
        {nextDay === null ? (
          <>
            <p className="max-w-xs text-sm text-muted text-balance">
              Come back tomorrow for three more words you can already see.
            </p>
            <Countdown />
          </>
        ) : (
          <>
            <p className="text-sm text-muted">Three new words have arrived. Also upside down.</p>
            <button type="button" onClick={onPlayNext} className="btn btn-secondary">
              PLAY CHALLENGE #{formatDayNumber(nextDay)}
              <ArrowRight size={18} strokeWidth={2.75} />
            </button>
          </>
        )}
      </motion.div>
    </motion.section>
  );
}
