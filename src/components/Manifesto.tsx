"use client";

import { manifesto } from "@/lib/copy";
import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section id="transmission" className="relative z-10 px-[7vw]">
      <div className="flex min-h-[100svh] flex-col justify-end pb-[18vh] pt-[12vh]">
        <Reveal>
          <p className="max-w-[11ch] font-serif text-[clamp(2.35rem,6.4vw,5.4rem)] font-light leading-[1.05] tracking-[-0.03em] text-ivory">
            {manifesto.inherit.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>

      <div className="flex min-h-[88svh] flex-col justify-center py-10">
        <Reveal>
          <ul className="ml-auto max-w-[10ch] space-y-5 text-right font-serif text-[clamp(1.5rem,3vw,2.45rem)] font-light italic leading-[1.2] text-ivory/64">
            {manifesto.qualities.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="flex min-h-[92svh] flex-col justify-center py-10">
        <Reveal>
          <p className="max-w-[13ch] font-serif text-[clamp(2.2rem,5.2vw,4.4rem)] font-light italic leading-[1.06] tracking-[-0.025em] text-ivory sm:ml-[12vw]">
            {manifesto.volta.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>

      <div className="flex min-h-[96svh] flex-col justify-end pb-[22vh] pt-16">
        <Reveal>
          <p className="max-w-[18ch] font-serif text-[clamp(1.85rem,3.4vw,2.85rem)] font-light leading-[1.22] tracking-[-0.02em] text-ivory">
            {manifesto.restoreLead}
          </p>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-16 max-w-[22ch] font-serif text-[clamp(1.2rem,2.1vw,1.7rem)] font-light leading-[1.55] text-ivory/70">
            {manifesto.restore.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
