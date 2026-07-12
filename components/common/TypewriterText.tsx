"use client";

import { motion } from "framer-motion";

export default function TypewriterText({
  text,
  className = "",
  delay = 0,
  speed = 0.045,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  const letters = Array.from(text);

  return (
    <span className={className} aria-label={text}>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.01, delay: delay + i * speed }}
        >
          {letter === " " ? " " : letter}
        </motion.span>
      ))}
    </span>
  );
}
