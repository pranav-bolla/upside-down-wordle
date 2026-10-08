import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { shareText } from "@/lib/share";

interface ShareButtonProps {
  /** Built on click so it always reflects the latest result. */
  getText: () => string;
  variant: "primary" | "secondary";
  children: ReactNode;
}

type Notice = "copied" | "failed" | null;

export default function ShareButton({ getText, variant, children }: ShareButtonProps) {
  const [notice, setNotice] = useState<Notice>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function handleClick() {
    const outcome = await shareText(getText());
    if (outcome === "shared" || outcome === "cancelled") return;
    setNotice(outcome);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setNotice(null), 2200);
  }

  return (
    <button type="button" onClick={handleClick} className={`btn btn-${variant}`}>
      {notice === "copied" ? (
        <>
          COPIED TO CLIPBOARD
          <Check size={18} strokeWidth={3} />
        </>
      ) : notice === "failed" ? (
        "COULDN’T COPY. SORRY."
      ) : (
        children
      )}
      <span role="status" className="sr-only">
        {notice === "copied" ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
