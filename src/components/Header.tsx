import { ChartNoAxesColumn, CircleQuestionMark, Settings } from "lucide-react";
import { GAME_NAME } from "@/lib/config";

export type ModalName = "stats" | "instructions" | "settings";

interface HeaderProps {
  onOpen: (modal: ModalName) => void;
}

const ACTIONS = [
  { modal: "stats", label: "Statistics", Icon: ChartNoAxesColumn },
  { modal: "instructions", label: "How to play", Icon: CircleQuestionMark },
  { modal: "settings", label: "Settings", Icon: Settings },
] as const;

export default function Header({ onOpen }: HeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-xl items-center justify-between px-5 pt-4 sm:pt-6">
      <h1 aria-label={GAME_NAME} className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-xl bg-accent text-white shadow-[0_3px_0_0_var(--color-accent-deep)]"
        >
          <span className="rotate-180 text-xl leading-none font-extrabold">{GAME_NAME.at(-1)}</span>
        </span>
        {/* The whole wordmark is rotated, full stop included. */}
        <span
          aria-hidden
          className="inline-block rotate-180 text-[1.375rem] leading-none font-extrabold tracking-tight"
        >
          {GAME_NAME}
          <span className="text-accent-ink">.</span>
        </span>
      </h1>

      <nav aria-label="Game menu" className="-mr-2 flex items-center">
        {ACTIONS.map(({ modal, label, Icon }) => (
          <button
            key={modal}
            type="button"
            aria-label={label}
            onClick={() => onOpen(modal)}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full text-ink/70 transition-colors hover:bg-ink/5 hover:text-ink active:bg-ink/10"
          >
            <Icon size={21} strokeWidth={2} />
          </button>
        ))}
      </nav>
    </header>
  );
}
