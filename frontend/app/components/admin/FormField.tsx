export default function FormField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </label>
  );
}

export const inputClass =
  "h-12 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-accent";
export const textareaClass =
  "w-full rounded-md border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-accent";
