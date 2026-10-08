import { AnimatePresence, motion } from "framer-motion";
import {
  guessesRemaining,
  isCaseMiss,
  wrongGuesses,
  type GameState,
  type RoundState,
} from "@/lib/game";
import type { GuessOutcome } from "@/lib/store";
import GuessInput from "./GuessInput";
import ProgressIndicator from "./ProgressIndicator";
import WordDisplay from "./WordDisplay";

interface GameCardProps {
  game: GameState;
  words: string[];
  /** Round on screen. Trails the game state briefly while feedback plays. */
  roundIndex: number;
  /** The last guess never reached the server. */
  offline: boolean;
  onGuess: (raw: string) => Promise<GuessOutcome>;
  onContinue: () => void;
}

function commentary(round: RoundState, roundIndex: number, word: string): string {
  const missed = wrongGuesses(round);
  const misses = missed.length;
  if (round.status === "won") {
    return misses === 0 ? "Incredible. You have eyes." : "Correct. Eventually.";
  }
  if (round.status === "lost") return `It said “${word}”. We turned it around for you.`;
  if (misses >= 1 && isCaseMiss(missed[misses - 1], word)) {
    return "Right letters. Wrong capitals. They count.";
  }
  if (misses >= 4) return "One guess left. The word has not moved.";
  if (misses >= 3) return "Have you considered looking at the word?";
  if (misses >= 1) return "Interesting interpretation.";
  if (roundIndex === 0) return "Read the upside-down word. Type your answer.";
  if (roundIndex === 2) return "Final round. Stay focused.";
  return "Same idea. Different word.";
}

export default function GameCard({
  game,
  words,
  roundIndex,
  offline,
  onGuess,
  onContinue,
}: GameCardProps) {
  const round = game.rounds[roundIndex];
  const word = words[roundIndex];
  const misses = wrongGuesses(round);
  const message = offline
    ? "Couldn’t reach the server. That guess didn’t count."
    : commentary(round, roundIndex, word);

  return (
    <section
      aria-label={`Word ${roundIndex + 1} of ${game.rounds.length}`}
      className="flex w-full flex-col items-center gap-5"
    >
      <ProgressIndicator rounds={game.rounds} current={roundIndex} />

      <div className="flex w-full flex-col items-center gap-2.5">
        <WordDisplay word={word} status={round.status} />
        <p className="text-xs text-muted">Yes, that&rsquo;s the whole puzzle.</p>
      </div>

      <GuessInput
        roundIndex={roundIndex}
        status={round.status}
        remaining={guessesRemaining(round)}
        isLastRound={roundIndex === game.rounds.length - 1}
        onGuess={onGuess}
        onContinue={onContinue}
      />

      <div className="flex min-h-16 w-full flex-col items-center gap-3">
        <p aria-live="polite" className="h-5 text-center text-sm font-medium text-ink">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={message}
              className="inline-block"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              {message}
            </motion.span>
          </AnimatePresence>
        </p>

        {misses.length > 0 && (
          <ul aria-label="Incorrect guesses" className="flex flex-wrap justify-center gap-1.5">
            {misses.map((guess, index) => (
              <motion.li
                key={`${roundIndex}-${index}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.16 }}
                className="max-w-40 truncate rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted line-through decoration-bad/60"
              >
                {guess}
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
