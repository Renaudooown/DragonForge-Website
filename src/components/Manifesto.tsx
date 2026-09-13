"use client";

import { manifesto } from "@/lib/copy";
import { Reveal } from "./Reveal";

export function Manifesto() {
  return (
    <section id="transmission" className="relative px-[8vw]">
      <div className="flex min-h-[100svh] flex-col justify-end pb-[16vh] pt-[18vh]">
        <Reveal>
          <p className="mb-16 flex items-center gap-3 font-sans text-[0.68rem] tracking-[0.42em] text-ivory/45 uppercase">
            <span className="inline-block h-1 w-1 rounded-full bg-red" />
            {manifesto.kicker}
          </p>
        </Reveal>
        <Reveal>
          <p className="max-w-[13.5ch] font-serif text-[clamp(2rem,5.4vw,4.35rem)] font-light leading-[1.08] tracking-[-0.02em] text-ivory">
            {manifesto.inherit.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>

      <div className="flex min-h-[85svh] flex-col justify-center py-12">
        <Reveal>
          <ul className="max-w-md space-y-4 font-serif text-[clamp(1.35rem,2.4vw,2rem)] font-light italic leading-snug text-ivory/70">
            {manifesto.qualities.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="flex min-h-[90svh] flex-col justify-center py-12">
        <Reveal>
          <p className="max-w-[12ch] font-serif text-[clamp(2.1rem,5vw,4.1rem)] font-light italic leading-[1.08] tracking-[-0.02em] text-ivory sm:ml-[18vw]">
            {manifesto.volta.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </Reveal>
      </div>

      <div className="flex min-h-[90svh] flex-col justify-center pb-[24vh] pt-12">
        <Reveal>
          <p className="max-w-2xl font-serif text-[clamp(1.35rem,2.6vw,2.15rem)] font-light leading-[1.45] text-ivory/78">
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
