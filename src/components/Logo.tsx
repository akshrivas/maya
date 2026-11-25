export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight text-ink ${className}`}>
      <span
        aria-hidden
        className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 font-serif text-lg text-white"
      >
        m
      </span>
      <span className="text-lg">maya</span>
    </span>
  );
}
