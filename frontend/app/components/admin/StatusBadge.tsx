import { FiCheckCircle, FiXCircle } from "react-icons/fi";

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
        <FiXCircle aria-hidden className="text-red-500" />
      )}
      {active ? "فعال" : "غیرفعال"}
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
