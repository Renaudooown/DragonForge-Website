"use client";

import { manifesto } from "@/lib/copy";
import { Reveal } from "./Reveal";

function Stanza({
  lines,
  className,
}: {
  lines: readonly string[];
  className?: string;
}) {
  return (
    <p className={className}>
      {lines.map((line) => (
        <span key={line} className="block sm:whitespace-nowrap">
          {line}
        </span>
      ))}
    </p>
  );
}

export function Manifesto() {
  return (
    <section id="transmission" className="relative z-10 px-[7vw]">
      <div className="flex min-h-[100svh] flex-col justify-end pb-[18vh] pt-[10vh]">
        <Reveal>
          <Stanza
            lines={manifesto.inherit}
            className="font-serif text-[clamp(2.05rem,4.6vw,4.05rem)] font-light leading-[1.12] tracking-[-0.028em] text-ivory"
          />
        </Reveal>
      </div>

      <div className="flex min-h-[100svh] flex-col justify-center">
        <Reveal>
          <ul className="ml-auto space-y-5 text-right font-serif text-[clamp(1.55rem,2.8vw,2.35rem)] font-light italic leading-[1.15] text-ivory/62">
            {manifesto.qualities.map((line) => (
              <li key={line} className="whitespace-nowrap">
                {line}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="flex min-h-[100svh] flex-col justify-center">
        <Reveal>
          <Stanza
            lines={manifesto.volta}
            className="font-serif text-[clamp(2.05rem,4.4vw,3.85rem)] font-light italic leading-[1.12] tracking-[-0.025em] text-ivory sm:ml-[18vw]"
          />
        </Reveal>
      </div>

      <div className="flex min-h-[100svh] flex-col justify-end pb-[22vh] pt-20">
        <Reveal>
          <p className="max-w-[14em] font-serif text-[clamp(1.7rem,3.1vw,2.55rem)] font-light leading-[1.2] tracking-[-0.02em] text-ivory">
            {manifesto.restoreLead}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Stanza
            lines={manifesto.restore}
            className="mt-14 font-serif text-[clamp(1.2rem,1.9vw,1.55rem)] font-light leading-[1.65] text-ivory/68"
          />
        </Reveal>
      </div>
    </section>
  );
}
