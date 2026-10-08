"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "framer-motion";
import { dayNumberAt, formatDayNumber } from "@/lib/daily";
import {
  activeRoundIndex,
  hasStarted,
  isComplete,
  type GameState,
} from "@/lib/game";
import { store, type GuessOutcome } from "@/lib/store";
import { CalmMotionContext } from "@/hooks/useCalmMotion";
import { useNow } from "@/hooks/useNow";
import GameCard from "./GameCard";
import Header, { type ModalName } from "./Header";
import InstructionsModal from "./InstructionsModal";
import ResultsScreen from "./ResultsScreen";
import SettingsModal from "./SettingsModal";
import StatsModal from "./StatsModal";

/** How long a correct answer is celebrated before the next word appears. */
const SUCCESS_PAUSE_MS = 1250;

interface PlayProps {
  game: GameState;
  words: string[];
  today: number;
}

function Play({ game, words, today }: PlayProps) {
  const roundCount = game.rounds.length;
  // The round on screen lags the saved game while feedback plays out.
  // roundCount means "show results".
  const [view, setView] = useState(() => {
    const active = activeRoundIndex(game);
    return active === -1 ? roundCount : active;
  });
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const [offline, setOffline] = useState(false);
  const advance = () => setView((current) => Math.min(current + 1, roundCount));

  async function handleGuess(raw: string): Promise<GuessOutcome> {
    const result = await store.submitGuess(raw, view);
    setOffline(result === "error");
    if (result === "correct") {
      timer.current = window.setTimeout(advance, SUCCESS_PAUSE_MS);
    } else if (result === "resync") {
      // Another tab got there first: jump to wherever the game really is.
      const active = activeRoundIndex(store.getSnapshot().remote?.game ?? game);
      setView(active === -1 ? roundCount : active);
    }
    return result;
  }

  const showResults = view >= roundCount;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={showResults ? "results" : "play"}
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {showResults ? (
          <ResultsScreen
            game={game}
            nextDay={today !== game.day ? today : null}
            onPlayNext={store.startToday}
          />
        ) : (
          <GameCard
            game={game}
            words={words}
            roundIndex={view}
            offline={offline}
            onGuess={handleGuess}
            onContinue={advance}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default function Game() {
  const app = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const now = useNow();
  const systemReducedMotion = useReducedMotion() ?? false;
  const [modal, setModal] = useState<ModalName | null>(null);

  const remote = app.remote;
  const today = remote ? dayNumberAt(now) : 0;
  const game = remote?.game;

  // Midnight UTC passed with the tab open: swap in the new challenge, unless
  // the player is mid-game or still looking at their results.
  useEffect(() => {
    if (game && today !== game.day && !hasStarted(game)) store.startToday();
  }, [game, today]);

  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && store.refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const calm = systemReducedMotion || app.settings.reduceMotion;
  const finished = game ? isComplete(game) : false;

  return (
    <MotionConfig reducedMotion={calm ? "always" : "never"}>
      <CalmMotionContext.Provider value={calm}>
        <div className="flex min-h-dvh flex-col">
          <Header onOpen={setModal} />

          <div className="mx-auto flex w-full max-w-md flex-col items-center gap-1.5 px-5 pt-7 text-center sm:pt-9">
            <p className="text-[0.6875rem] font-bold tracking-[0.22em] text-accent-ink">
              DAILY CHALLENGE #{game ? formatDayNumber(game.day) : "···"}
            </p>
            <p className="text-sm text-muted">Three words. All upside down. Good luck.</p>
          </div>

          <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 py-7">
            {remote && game ? (
              <Play
                key={`${game.day}:${app.version}`}
                game={game}
                words={remote.words}
                today={today}
              />
            ) : app.status === "error" ? (
              <div role="alert" className="flex w-full flex-col items-center gap-5 text-center">
                <p className="text-lg font-bold">The words failed to load.</p>
                <p className="text-sm text-muted">
                  They are still upside down, wherever they are.
                </p>
                <button type="button" onClick={store.retry} className="btn btn-primary">
                  TRY AGAIN
                </button>
              </div>
            ) : null}
          </main>

          <footer className="px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-center text-xs text-muted/80">
            {finished
              ? "See you tomorrow. Bring your eyes."
              : "An intellectual challenge of questionable difficulty."}
          </footer>
        </div>

        <AnimatePresence>
          {remote && game && modal === "stats" && (
            <StatsModal
              key="stats"
              stats={remote.stats}
              game={game}
              today={today}
              onClose={() => setModal(null)}
            />
          )}
          {modal === "instructions" && (
            <InstructionsModal key="instructions" onClose={() => setModal(null)} />
          )}
          {modal === "settings" && (
            <SettingsModal
              key="settings"
              settings={app.settings}
              onChange={store.updateSettings}
              onClose={() => setModal(null)}
            />
          )}
        </AnimatePresence>
      </CalmMotionContext.Provider>
    </MotionConfig>
  );
}
