export function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = String(dateStr).split("T")[0].split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
