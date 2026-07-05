import Link from "next/link";
import type { IconType } from "react-icons";
import { FiArrowRight } from "react-icons/fi";

export default function AdminPageHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  backHref = "/admin",
  backLabel = "بازگشت به داشبورد",
  action,
}: {
  icon: IconType;
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="h-eyebrow flex items-center gap-2">
          <Icon aria-hidden />
          {eyebrow}
        </p>
        <h1 className="h-display mt-3 text-3xl text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-8 text-muted">
          {description}
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-3">
        {action}
        <Link
          href={backHref}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-5 text-sm font-black text-foreground transition hover:border-accent hover:text-accent"
        >
          {backLabel}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
