"use client";

import { manifesto } from "@/lib/copy";
import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section
      id="transmission"
      className="relative flex min-h-[100svh] items-center overflow-hidden px-6 py-28 sm:py-36"
    >
      <div className="manifesto-wash pointer-events-none absolute inset-0" />
      <div className="relative mx-auto w-full max-w-3xl text-center">
        <Reveal>
          <p className="mb-10 flex items-center justify-center gap-3 font-sans text-[0.68rem] tracking-[0.42em] text-ivory/50 uppercase">
            <span className="inline-block h-1 w-1 rounded-full bg-red" />
            {manifesto.kicker}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="font-serif text-[clamp(2.4rem,6.4vw,4.85rem)] font-light leading-[1.05] tracking-[-0.02em] text-ivory">
            {manifesto.heading[0]}
            <br />
            {manifesto.heading[1]}
          </h2>
        </Reveal>
        <div className="mx-auto mt-16 max-w-2xl space-y-8">
          {manifesto.paragraphs.map((paragraph, index) => (
            <Reveal key={paragraph} delay={0.12 + index * 0.08}>
              <p
                className={
                  index === 1
                    ? "font-serif text-[1.35rem] font-light italic leading-snug text-ivory/88 sm:text-[1.6rem]"
                    : "font-serif text-[1.15rem] font-light leading-[1.65] text-ivory/72 sm:text-[1.35rem]"
                }
              >
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
