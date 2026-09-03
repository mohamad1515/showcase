export function moneyToNumber(value: string) {
  return Number(value.replace(/[^\d]/g, ""));
}

export function formatMoney(value: number) {
  return value.toLocaleString("en-US");
}

export function calculateLineTotal(unitPrice: string, quantity: number) {
  return formatMoney(moneyToNumber(unitPrice) * quantity);
}

export function calculateCartTotal(items: { lineTotal: string }[]) {
  const total = items.reduce(
    (sum, item) => sum + moneyToNumber(item.lineTotal),
    0,
  );
  return formatMoney(total);
}
