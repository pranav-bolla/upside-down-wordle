import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import type { RoundStatus } from "@/lib/game";

interface WordDisplayProps {
  word: string;
  status: RoundStatus;
}

/** Rough rendered width in ems: "mummy" is far wider than "lilit". */
export function estimateEms(word: string): number {
  let ems = 0;
  for (const letter of word) {
    if ("mw".includes(letter)) ems += 0.95;
    else if ("ijl".includes(letter)) ems += 0.32;
    else if ("ftr".includes(letter)) ems += 0.45;
    else ems += 0.64;
  }
  return ems;
}

export default function WordDisplay({ word, status }: WordDisplayProps) {
  const won = status === "won";
  const lost = status === "lost";
  // Sized off the card's own width so even nine letters stay on one line.
  const fontSize = `min(${(86 / estimateEms(word)).toFixed(1)}cqw, 7.5rem)`;

  return (
    <motion.div
      className={`relative flex h-44 w-full items-center justify-center overflow-hidden rounded-[2rem] border px-5 shadow-[0_1px_2px_rgba(32,32,32,0.04),0_12px_32px_-12px_rgba(32,32,32,0.12)] transition-colors duration-300 sm:h-56 ${
        won ? "border-good bg-good-tint" : lost ? "border-bad bg-surface" : "border-line bg-surface"
      }`}
      initial={false}
      animate={{ scale: won ? [1, 1.03, 1] : 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex w-full items-center justify-center [container-type:inline-size]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={word}
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {/* Rotated 180° as rendered. On a miss it turns the right way up. */}
            <motion.span
              className={`block leading-none font-extrabold tracking-tight whitespace-nowrap transition-colors duration-200 select-none ${
                won ? "text-good" : "text-ink"
              }`}
              style={{ fontSize }}
              initial={false}
              animate={{ rotate: lost ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 180, damping: 18 }}
            >
              {word}
            </motion.span>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {won && (
          <motion.span
            aria-hidden
            className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full bg-good text-white"
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
          >
            <Check size={18} strokeWidth={3.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
