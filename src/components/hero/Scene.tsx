"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef } from "react";
import { hero } from "@/lib/copy";
import { Manifesto } from "@/components/Manifesto";
import { SolarForge } from "./SolarForge";

const ease = [0.16, 1, 0.3, 1] as const;

function HeroType({
  opacity,
  y,
}: {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex h-[100svh] min-h-[640px] items-end px-6 pb-16 sm:items-center sm:px-[8vw] sm:pb-0 sm:pt-[18vh]">
      <motion.div
        className="max-w-xl"
        style={reduce ? undefined : { opacity, y }}
      >
        <motion.h1
          className="font-serif text-[clamp(2.4rem,6vw,4.75rem)] font-light leading-[0.95] tracking-[0.06em] text-ivory"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.45, ease }}
        >
          {hero.wordmark}
        </motion.h1>
        <motion.p
          className="mt-7 max-w-sm font-sans text-[0.72rem] font-normal tracking-[0.28em] text-ivory/68 uppercase sm:text-[0.78rem]"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.85, ease }}
        >
          {hero.line}
        </motion.p>
      </motion.div>
    </section>
  );
}

export function Scene() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end start"],
  });

  const sunX = useTransform(scrollYProgress, [0, 0.36], ["0%", "18%"]);
  const sunY = useTransform(scrollYProgress, [0, 0.36], ["0%", "-24%"]);
  const sunScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.38]);
  const sunOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 1, 0]);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const typeY = useTransform(scrollYProgress, [0, 0.12], [0, -24]);

  return (
    <div ref={sceneRef} className="relative">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-navy [isolation:isolate]">
          <motion.div
            className="h-full w-full origin-[84%_12%]"
            style={
              reduce
                ? undefined
                : { x: sunX, y: sunY, scale: sunScale, opacity: sunOpacity }
            }
          >
            <SolarForge />
          </motion.div>
        </div>
      </div>
      <div className="relative z-10">
        <HeroType opacity={typeOpacity} y={typeY} />
        <Manifesto />
      </div>
    </div>
  );
}
