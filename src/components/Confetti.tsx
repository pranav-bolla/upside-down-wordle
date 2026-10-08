import { motion } from "framer-motion";

const COLORS = ["#5757f5", "#1f9d61", "#f5b83d", "#f08c3a", "#a9a9fb"];
const PIECES = 56;

/** Stable pseudo-random value in [0, 1) so every render lays out the same. */
function noise(index: number, salt: number): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {Array.from({ length: PIECES }, (_, i) => {
        const round = noise(i, 5) > 0.7;
        return (
          <motion.span
            key={i}
            className="absolute top-0 block"
            style={{
              left: `${noise(i, 1) * 100}%`,
              width: 6 + noise(i, 2) * 5,
              height: round ? 6 + noise(i, 2) * 5 : 10 + noise(i, 3) * 8,
              borderRadius: round ? 999 : 2,
              backgroundColor: COLORS[i % COLORS.length],
            }}
            initial={{ y: "-6vh", x: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: "108vh",
              x: (noise(i, 4) - 0.5) * 180,
              rotate: (noise(i, 6) - 0.5) * 900,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 2.1 + noise(i, 7) * 1.5,
              delay: noise(i, 8) * 0.55,
              ease: [0.2, 0.5, 0.6, 1],
              opacity: { times: [0, 0.8, 1], duration: 2.1 + noise(i, 7) * 1.5 },
            }}
          />
        );
      })}
    </div>
  );
}
