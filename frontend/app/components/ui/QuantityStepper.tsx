'use client';

import { FiMinus, FiPlus } from 'react-icons/fi';

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="border-border bg-surface inline-flex h-11 items-center rounded-md border">
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="text-foreground hover:text-accent flex h-full w-10 items-center justify-center transition-colors"
        aria-label="افزایش تعداد"
      >
        <FiPlus aria-hidden />
      </button>
      <span className="text-foreground min-w-10 text-center text-sm font-black tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="text-foreground hover:text-accent flex h-full w-10 items-center justify-center transition-colors"
        aria-label="کاهش تعداد"
      >
        <FiMinus aria-hidden />
      </button>
    </div>
  );
}
