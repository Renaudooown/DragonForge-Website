import { footer } from "@/lib/copy";

export function SiteFooter() {
  return (
    <footer className="px-6 pb-14 pt-4 sm:pb-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 border-t border-ivory/10 pt-16 text-center">
        <p className="font-serif text-xl font-light tracking-[0.22em] text-ivory/80 uppercase">
          {footer.mark}
        </p>
        <p className="font-sans text-[0.68rem] tracking-[0.18em] text-ivory/38 uppercase">
          {footer.lines.join(" ")}
        </p>
      </div>
    </footer>
  );
}
