// utils/formatters.ts

// "2008-04-30" -> local date. Parsed by parts so the timezone cannot shift the day.
export const formatDate = (value?: string | null): string => {
  if (!value) {
    return "-";
  }
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) {
    return "-";
  }
  return new Date(y, m - 1, d).toLocaleDateString();
};

// 140000000 -> "$140M", 585174222 -> "$585.2M", 1500000000 -> "$1.5B"
export const formatMoney = (value?: number | null): string => {
  if (!value || value <= 0) {
    return "-";
  }
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (value >= 1_000_000_000) {
    return `$${trim(value / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `$${trim(value / 1_000_000)}M`;
  }
  return `$${value.toLocaleString()}`;
};

// 126 -> "2h 6m"
export const formatRuntime = (minutes?: number | null): string => {
  if (!minutes || minutes <= 0) {
    return "-";
  }
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) {
    return `${m}m`;
  }
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

// 29292 -> "29.3K", 1250000 -> "1.3M"
export const formatCount = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return "0";
  }
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (value >= 1_000_000) {
    return `${trim(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${trim(value / 1_000)}K`;
  }
  return String(value);
};

// ("2011-12-04", "2025-04-10", true) -> "2011–" ; (…, false) -> "2011–2025"
export const formatYearRange = (
  start?: string | null,
  end?: string | null,
  ongoing?: boolean,
): string => {
  const from = start?.slice(0, 4);
  if (!from) {
    return "-";
  }
  if (ongoing) {
    return `${from}–`;
  }
  const to = end?.slice(0, 4);
  return !to || to === from ? from : `${from}–${to}`;
};

// "2025-06-01" -> "in 12 days" / "Tomorrow" / "Today"; null -> "TBA"
export const formatDaysUntil = (value?: string | null): string => {
  if (!value) {
    return "TBA";
  }
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) {
    return "TBA";
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(y, m - 1, d);
  // Math.round absorbs the 23/25 hour days of DST changes.
  const days = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) {
    return formatDate(value);
  }
  if (days === 0) {
    return "Today";
  }
  return days === 1 ? "Tomorrow" : `in ${days} days`;
};
