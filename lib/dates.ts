// lib/dates.ts
// Today's date in the user's own time zone (YYYY-MM-DD).
// toISOString() gives the UTC date, which is "yesterday" in Kenya between 00:00 and 03:00.
export function localDateStr(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}