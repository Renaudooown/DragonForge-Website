"use client";

import { community } from "@/lib/copy";
import { Reveal } from "./Reveal";

export function Principles() {
  return (
    <section className="relative flex min-h-[88svh] items-center px-6 py-32 sm:py-40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mx-auto max-w-2xl text-center font-serif text-[1.45rem] font-light leading-snug text-ivory/80 sm:text-[1.85rem]">
            {community.statement[0]}
            <br />
            {community.statement[1]}
          </p>
        </Reveal>

        <div className="mt-20 grid gap-12 border-t border-ivory/10 pt-16 sm:mt-28 sm:grid-cols-3 sm:gap-8 sm:pt-20">
          {community.principles.map((item, index) => (
            <Reveal key={item.index} delay={index * 0.1}>
              <article className="text-center sm:text-left">
                <p className="mb-5 font-sans text-[0.65rem] tracking-[0.32em] text-red/80">
                  {item.index}
                </p>
                <h3 className="font-serif text-[2rem] font-light leading-none tracking-[-0.02em] text-ivory sm:text-[2.35rem]">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-[0.72rem] tracking-[0.22em] text-ivory/55 uppercase">
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
