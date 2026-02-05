const DEFAULT_CURRENCY = "R$";

export function formatCurrency(value: number | string | null | undefined, maxDecimals: number = 2, currency?: string): string {
  const currencySymbol = currency || DEFAULT_CURRENCY;
  if (value === null || value === undefined) return `${currencySymbol} 0,00`;
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return `${currencySymbol} 0,00`;
  return `${currencySymbol} ${num.toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: maxDecimals})}`;
}
