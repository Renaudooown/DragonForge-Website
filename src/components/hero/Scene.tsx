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
    <section className="relative z-10 h-[100svh] min-h-[640px]">
      <motion.div
        className="absolute bottom-[16vh] left-6 max-w-[16ch] sm:bottom-[20vh] sm:left-[7vw]"
        style={reduce ? undefined : { opacity, y }}
      >
        <motion.h1
          className="font-serif text-[clamp(2.6rem,6.2vw,5.1rem)] font-light leading-[0.92] tracking-[0.01em] text-ivory"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.6, delay: 0.4, ease }}
        >
          {hero.wordmark}
        </motion.h1>
        <motion.p
          className="mt-8 max-w-[22ch] font-sans text-[0.8rem] font-normal leading-relaxed tracking-[0.04em] text-ivory/58 sm:text-[0.86rem]"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.9, ease }}
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

  const sunFade = useTransform(scrollYProgress, [0, 0.16, 0.38], [1, 1, 0]);
  const typeOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const typeY = useTransform(scrollYProgress, [0, 0.1], [0, -18]);

  return (
    <div ref={sceneRef} className="relative">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <SolarForge
          fade={reduce ? undefined : sunFade}
          progress={reduce ? undefined : scrollYProgress}
        />
      </div>
      <HeroType opacity={typeOpacity} y={typeY} />
      <Manifesto />
    </div>
  );
}
