// lib/servings.ts
// Scales an ingredient amount. factor = chosenServings / recipe.servings

export function scaledAmount(
  i: { amount: string; qty?: number | null; unit?: string },
  factor: number,
): string {
  if (factor === 1 || i.qty == null || i.unit === "to_taste") return i.amount;
  const q = Math.round(i.qty * factor * 4) / 4;
  const whole = Math.floor(q);
  const frac = q - whole;
  const f = frac === 0.25 ? "1/4" : frac === 0.5 ? "1/2" : frac === 0.75 ? "3/4" : "";
  const num = [whole || "", f].filter(Boolean).join(" ") || "0";
  return i.unit == null || i.unit === "piece" ? num : `${num} ${i.unit}`;
}