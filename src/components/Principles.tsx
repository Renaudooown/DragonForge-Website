"use client";

import { community } from "@/lib/copy";
import { Reveal } from "./Reveal";

export function Principles() {
  return (
    <section className="relative z-20 bg-navy px-[8vw] py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="max-w-xl font-serif text-[1.45rem] font-light leading-snug text-ivory/78 sm:text-[1.85rem]">
            {community.statement[0]}
            <br />
            {community.statement[1]}
          </p>
        </Reveal>

        <div className="mt-24 grid gap-14 border-t border-ivory/10 pt-16 sm:mt-32 sm:grid-cols-3 sm:gap-10 sm:pt-20">
          {community.principles.map((item, index) => (
            <Reveal key={item.index} delay={index * 0.1}>
              <article>
                <p className="mb-5 font-sans text-[0.65rem] tracking-[0.32em] text-red/80">
                  {item.index}
                </p>
                <h3 className="font-serif text-[2rem] font-light leading-none tracking-[-0.02em] text-ivory sm:text-[2.35rem]">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-[0.72rem] tracking-[0.22em] text-ivory/50 uppercase">
                  {item.aside}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
