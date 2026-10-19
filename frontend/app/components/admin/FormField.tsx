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
      <span className="text-foreground text-sm font-bold">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <p className="text-muted mt-1.5 text-xs">{hint}</p>}
    </label>
  );
}

export const inputClass =
  'h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent';
export const textareaClass =
  'min-h-24 w-full rounded-md border border-border bg-background px-3 py-3 text-sm leading-7 text-foreground outline-none transition focus:border-accent';
