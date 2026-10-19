'use client';

import { useEffect, useState } from 'react';

const thumbClass =
  'absolute inset-x-0 top-1/2 h-4 w-full -translate-y-1/2 appearance-none bg-transparent pointer-events-none ' +
  '[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-sm ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:bg-accent [&::-moz-range-thumb]:shadow-sm';

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
  // Local state drives the thumbs and fill bar on every drag tick, so the
  // control itself stays instantly responsive. The parent's onChange (which
  // re-filters and re-sorts the whole catalog) only fires once the drag
  // settles — committing on every pixel of movement would re-render the
  // entire grid dozens of times per second.
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const percent = (v: number) => ((v - min) / (max - min)) * 100;

  function commit() {
    onChange(local);
  }

  return (
    <div className="space-y-3">
      <div className="relative h-4">
        <div className="bg-border absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full">
          <div
            className="bg-accent absolute h-1.5 rounded-full"
            style={{
              right: `${percent(local[0])}%`,
              left: `${100 - percent(local[1])}%`,
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={local[0]}
          onChange={(event) =>
            setLocal(([, hi]) => [Math.min(Number(event.target.value), hi), hi])
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          onBlur={commit}
          className={thumbClass}
          aria-label="حداقل قیمت"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={local[1]}
          onChange={(event) =>
            setLocal(([lo]) => [lo, Math.max(Number(event.target.value), lo)])
          }
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          onBlur={commit}
          className={thumbClass}
          aria-label="حداکثر قیمت"
        />
      </div>
      <p className="text-muted tabular-fa text-xs font-bold">
        قیمت: {local[0].toLocaleString('fa-IR')} — {local[1].toLocaleString('fa-IR')} تومان
      </p>
    </div>
  );
}
