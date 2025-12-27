export function parseISODate(iso) {
  // Expect YYYY-MM-DD
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function startOfYear(year) {
  return new Date(Date.UTC(year, 0, 1));
}

export function endOfYear(year) {
  return new Date(Date.UTC(year, 11, 31));
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

export function addYears(date, years) {
  const d = new Date(date);
  d.setUTCFullYear(d.getUTCFullYear() + years);
  return d;
}

export function intersectsYear(startDate, endDate, year) {
  return (
    startDate <= endOfYear(year) &&
    endDate >= startOfYear(year)
  );
}
