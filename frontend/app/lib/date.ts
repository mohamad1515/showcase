/** Persian (Jalali) long date, e.g. "۲۹ شهریور ۱۴۰۵". */
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
