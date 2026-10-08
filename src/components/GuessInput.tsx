import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { RoundStatus } from "@/lib/game";
import type { GuessOutcome } from "@/lib/store";

interface GuessInputProps {
  roundIndex: number;
  status: RoundStatus;
  remaining: number;
  isLastRound: boolean;
  onGuess: (raw: string) => Promise<GuessOutcome>;
  onContinue: () => void;
}

const RING_OFF = "0 0 0 0px rgba(229,72,77,0)";
const RING_ON = "0 0 0 4px rgba(229,72,77,0.28)";

export default function GuessInput({
  roundIndex,
  status,
  remaining,
  isLastRound,
  onGuess,
  onContinue,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const shake = useAnimationControls();

  // Keyboard players land in the field each round. Touch players tap it
  // themselves, so the on-screen keyboard never opens uninvited.
  useEffect(() => {
    if (status === "lost") {
      continueRef.current?.focus();
    } else if (status === "playing" && window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, [roundIndex, status]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status !== "playing" || pending) return;
    setPending(true);
    const result = await onGuess(value);
    setPending(false);
    // A guess that never arrived stays in the field, ready to resend.
    if (result === "ignored" || result === "error") return;
    setValue("");
    if (result === "wrong" || result === "failed") {
      shake.start({
        x: [0, -9, 9, -6, 6, -3, 3, 0],
        boxShadow: [RING_ON, RING_ON, RING_ON, RING_ON, RING_ON, RING_ON, RING_ON, RING_OFF],
        transition: { duration: 0.42, ease: "easeOut" },
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3" noValidate>
      <motion.div animate={shake} className="rounded-2xl">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={status === "lost"}
          placeholder="Type what you see..."
          aria-label={`Your guess for word ${roundIndex + 1}`}
          maxLength={24}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          className="h-14 w-full rounded-2xl border border-line bg-surface px-5 text-center text-lg font-semibold tracking-wide text-ink transition-[border-color,box-shadow] outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-muted/70 focus:border-accent focus:shadow-[0_0_0_4px_rgba(87,87,245,0.16)] disabled:bg-paper disabled:text-muted"
        />
      </motion.div>

      {status === "lost" ? (
        <button
          ref={continueRef}
          type="button"
          onClick={onContinue}
          className="btn btn-primary"
        >
          {isLastRound ? "SEE RESULTS" : "NEXT WORD"}
          <ArrowRight size={18} strokeWidth={2.75} />
        </button>
      ) : status === "won" ? (
        <button type="submit" className="btn btn-good" aria-disabled>
          CORRECT
          <Check size={18} strokeWidth={3} />
        </button>
      ) : (
        <button type="submit" className="btn btn-primary" aria-busy={pending}>
          GUESS
          <ArrowRight size={18} strokeWidth={2.75} />
        </button>
      )}

      <p className="text-center text-sm text-muted tabular-nums">
        {remaining} {remaining === 1 ? "guess" : "guesses"} remaining
      </p>
    </form>
  );
}
