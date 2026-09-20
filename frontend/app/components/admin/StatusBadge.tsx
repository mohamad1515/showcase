import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import type { CommentStatus } from "../../lib/products";

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      }`}
    >
      {active ? (
        <FiCheckCircle aria-hidden className="text-green-500" />
      ) : (
        <FiXCircle aria-hidden />
      )}
      {active ? "فعال" : "غیرفعال"}
    </span>
  );
}

export function CommentStatusBadge({ status }: { status: CommentStatus }) {
  const answered = status === "ANSWERED";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        answered ? "bg-success-soft text-success" : "bg-accent-soft text-accent"
      }`}
    >
      {answered ? <FiCheckCircle aria-hidden /> : <FiClock aria-hidden />}
      {answered ? "پاسخ داده‌شده" : "بدون پاسخ"}
    </span>
  );
}

export function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
      {children}
    </span>
  );
}
