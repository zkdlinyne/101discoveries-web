const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatPrice(cents: number): string {
  return usd.format(cents / 100);
}

// 0 -> "K"; otherwise the grade number. Renders a range like "K–2" or "3–5".
export function formatGradeRange(min: number, max: number): string {
  const label = (g: number) => (g <= 0 ? "K" : String(g));
  return min === max ? label(min) : `${label(min)}–${label(max)}`;
}

// Postgres `time` comes back as "HH:MM:SS" (or "HH:MM"). Format to "4:00 PM".
export function formatTime(value: string | null): string | null {
  if (!value) return null;
  const [hStr, mStr] = value.split(":");
  const hour = Number(hStr);
  const minute = Number(mStr ?? "0");
  if (Number.isNaN(hour)) return null;

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  const mm = minute.toString().padStart(2, "0");
  return `${hour12}:${mm} ${period}`;
}

// "Tuesday · 4:00–5:00 PM" style schedule line, gracefully degrading.
export function formatSchedule(
  day: string | null,
  start: string | null,
  end: string | null,
): string | null {
  const startLabel = formatTime(start);
  const endLabel = formatTime(end);

  const timeLabel =
    startLabel && endLabel
      ? `${startLabel} – ${endLabel}`
      : (startLabel ?? null);

  if (day && timeLabel) return `${day} · ${timeLabel}`;
  return day ?? timeLabel ?? null;
}
