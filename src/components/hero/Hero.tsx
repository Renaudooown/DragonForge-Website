"use client";

import { motion, useReducedMotion } from "framer-motion";
import { hero } from "@/lib/copy";
import { SolarForge } from "./SolarForge";

const ease = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.6, ease }}
      >
        <SolarForge />
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[42%] bg-linear-to-t from-navy/70 to-transparent" />
      <div className="relative z-10 flex h-full flex-col items-center">
        <div className="flex flex-1 flex-col items-center justify-end px-6 pb-[min(11vh,6.5rem)] text-center">
          <motion.h1
            className="font-serif text-[clamp(2.6rem,8vw,6.4rem)] font-light leading-none tracking-[0.18em] text-ivory uppercase [text-shadow:0_0_42px_rgba(0,2,44,0.55)]"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.55, ease }}
          >
            {hero.wordmark}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-md font-sans text-[0.7rem] font-normal tracking-[0.34em] text-ivory/70 uppercase sm:text-[0.78rem]"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.9, ease }}
          >
            {hero.line}
          </motion.p>
          <motion.p
            className="mt-3 font-serif text-sm font-light italic tracking-[0.04em] text-ivory/45 sm:text-[0.95rem]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 1.2, ease }}
          >
            {hero.subline}
          </motion.p>
        </div>
      </div>

      <motion.a
        href="#transmission"
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-ivory/40 transition-colors hover:text-ivory/70"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.8 }}
      >
        <span className="font-sans text-[0.62rem] tracking-[0.38em] uppercase">
          {hero.scroll}
        </span>
        <span className="scroll-line h-11 w-px bg-linear-to-b from-ivory/55 to-transparent" />
      </motion.a>
    </section>
  );
}
