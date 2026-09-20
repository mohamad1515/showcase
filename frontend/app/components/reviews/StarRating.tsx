"use client";

import { useState, type KeyboardEvent } from "react";
import { FiStar } from "react-icons/fi";

const STARS = [1, 2, 3, 4, 5];

const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
} as const;

type Size = keyof typeof sizes;

type Props = {
  /** Rating from 0 to 5. Fractions render as a partially filled star. */
  value: number;
  /** When provided the component is an input that picks a whole rating from 1 to 5. */
  onChange?: (rating: number) => void;
  size?: Size;
  /** Accessible label; defaults to the rating text (display) or "امتیاز شما" (input). */
  label?: string;
  className?: string;
};

function StarRow({ size, filled }: { size: Size; filled: boolean }) {
  return (
    <span className="flex w-max">
      {STARS.map((n) => (
        <FiStar
          key={n}
          aria-hidden
          className={`mx-0.5 shrink-0 ${sizes[size]} ${filled ? "fill-current" : ""}`}
        />
      ))}
    </span>
  );
}

function StarDisplay({
  value,
  size,
  label,
  className,
}: Required<Pick<Props, "value" | "size">> & Pick<Props, "label" | "className">) {
  const percent = (Math.min(Math.max(value, 0), 5) / 5) * 100;

  return (
    <span
      role="img"
      aria-label={label ?? `امتیاز ${value} از 5`}
      className={`relative inline-flex text-muted/40 ${className ?? ""}`}
    >
      <StarRow size={size} filled={false} />
      <span
        aria-hidden
        className="absolute inset-y-0 start-0 overflow-hidden text-yellow-400"
        style={{ width: `${percent}%` }}
      >
        <StarRow size={size} filled />
      </span>
    </span>
  );
}

function StarInput({
  value,
  onChange,
  size,
  label,
  className,
}: Required<Pick<Props, "value" | "onChange" | "size">> &
  Pick<Props, "label" | "className">) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, n: number) {
    // In RTL the first star is on the right, so "more stars" is the left arrow.
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    let next = n;
    if (event.key === "ArrowUp" || event.key === (rtl ? "ArrowLeft" : "ArrowRight")) {
      next = Math.min(5, n + 1);
    } else if (
      event.key === "ArrowDown" ||
      event.key === (rtl ? "ArrowRight" : "ArrowLeft")
    ) {
      next = Math.max(1, n - 1);
    } else {
      return;
    }
    event.preventDefault();
    onChange(next);
    (event.currentTarget.parentElement?.children[next - 1] as HTMLElement | undefined)?.focus();
  }

  return (
    <span
      role="radiogroup"
      aria-label={label ?? "امتیاز شما"}
      className={`inline-flex ${className ?? ""}`}
      onMouseLeave={() => setHover(0)}
    >
      {STARS.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} از 5`}
          tabIndex={n === (value || 1) ? 0 : -1}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onKeyDown={(event) => handleKeyDown(event, n)}
          className={`rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-accent ${
            n <= shown ? "text-yellow-400" : "text-muted/40"
          }`}
        >
          <FiStar
            aria-hidden
            className={`${sizes[size]} ${n <= shown ? "fill-current" : ""}`}
          />
        </button>
      ))}
    </span>
  );
}

/**
 * The only star widget in the app: read-only (summary, comments, admin list)
 * or, when `onChange` is passed, an input for the review form.
 */
export default function StarRating({
  value,
  onChange,
  size = "md",
  label,
  className,
}: Props) {
  return onChange ? (
    <StarInput
      value={value}
      onChange={onChange}
      size={size}
      label={label}
      className={className}
    />
  ) : (
    <StarDisplay value={value} size={size} label={label} className={className} />
  );
}
