export default function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="blob bg-accent/20 absolute -top-32 -right-24 h-[480px] w-[480px] rounded-full blur-3xl"
        style={{ animationDuration: '24s' }}
      />
      <div
        className="blob bg-gold/18 absolute top-1/4 -left-28 h-[280px] w-[280px] rounded-full blur-2xl"
        style={{ animationDuration: '30s', animationDelay: '-6s' }}
      />
      <div
        className="blob bg-gold/20 absolute -bottom-28 -left-24 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ animationDuration: '27s', animationDelay: '-12s' }}
      />
      <div
        className="blob bg-accent/16 absolute -bottom-20 right-[8%] h-[320px] w-[320px] rounded-full blur-2xl"
        style={{ animationDuration: '22s', animationDelay: '-4s' }}
      />
    </div>
  );
}
