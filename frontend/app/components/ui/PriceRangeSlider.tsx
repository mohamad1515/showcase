'use client';

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative h-1.5 rounded-full bg-[var(--border)]">
        <div
          className="bg-accent absolute h-1.5 rounded-full"
          style={{
            right: `${((value[0] - min) / (max - min)) * 100}%`,
            left: `${100 - ((value[1] - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value[0]}
        onChange={(event) => onChange([Math.min(Number(event.target.value), value[1]), value[1]])}
        className="accent-[var(--accent)] block w-full"
        aria-label="حداقل قیمت"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={value[1]}
        onChange={(event) => onChange([value[0], Math.max(Number(event.target.value), value[0])])}
        className="accent-[var(--accent)] block w-full"
        aria-label="حداکثر قیمت"
      />
      <p className="text-muted tabular-fa text-xs font-bold">
        قیمت: {value[0].toLocaleString('fa-IR')} — {value[1].toLocaleString('fa-IR')} تومان
      </p>
    </div>
  );
}
