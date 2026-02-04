const CURRENCY_SYMBOL = process.env.NEXT_PUBLIC_CURRENCY || "R$";

export function formatCurrency(value: number | string | null | undefined, maxDecimals: number = 2): string {
  if (value === null || value === undefined) return `${CURRENCY_SYMBOL} 0,00`;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return `${CURRENCY_SYMBOL} 0,00`;
  return `${CURRENCY_SYMBOL} ${num.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: maxDecimals})}`;
}
