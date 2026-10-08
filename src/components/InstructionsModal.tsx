import { TAGLINE } from "@/lib/config";
import Modal from "./Modal";

interface InstructionsModalProps {
  onClose: () => void;
}

const STEPS = ["Look at the word.", "Read the word.", "Type the word."];

const SCORING = [
  { emoji: "🟩", label: "First guess", points: "100" },
  { emoji: "🟨", label: "Second or third guess", points: "75 / 50" },
  { emoji: "🟧", label: "Fourth or fifth guess", points: "25 / 10" },
  { emoji: "🟥", label: "Did not read the word", points: "0" },
];

export default function InstructionsModal({ onClose }: InstructionsModalProps) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <ol className="flex flex-col gap-2.5">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {index + 1}
            </span>
            <span className="text-base font-semibold">{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-center text-sm font-medium">That&rsquo;s literally it.</p>

      <h3 className="mt-7 mb-2.5 text-xs font-bold tracking-[0.2em] text-muted">SCORING</h3>
      <ul className="flex flex-col gap-2 text-sm">
        {SCORING.map(({ emoji, label, points }) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span>
              <span aria-hidden className="mr-2.5">
                {emoji}
              </span>
              {label}
            </span>
            <span className="font-semibold tabular-nums">{points}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 border-t border-line pt-4 text-sm text-muted">
        Three words a day, five guesses each. Capitals count, so type the word exactly as
        it appears. Everyone gets the same words, and new ones arrive at midnight UTC.
      </p>
      <p className="mt-3 text-xs text-muted/80">{TAGLINE}</p>
    </Modal>
  );
}
