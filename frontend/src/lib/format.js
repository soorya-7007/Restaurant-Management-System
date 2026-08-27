/**
 * Sequelize returns DECIMAL columns as strings on MySQL but as numbers on
 * SQLite, so `price.toFixed(2)` crashed under Docker while working locally.
 * Everything that touches money goes through here first.
 */
export function toNumber(value, fallback = 0) {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(value) {
  return currency.format(toNumber(value));
}

/** Whole rupees, for tight spots like the mobile cart bar. */
export function formatCurrencyCompact(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

/** Minutes since `date`. Returns 0 for missing or unparseable input. */
export function minutesSince(date, now = Date.now()) {
  if (!date) return 0;
  const then = new Date(date).getTime();
  if (!Number.isFinite(then)) return 0;
  return Math.max(0, Math.floor((now - then) / 60000));
}

/** Compact ticket age for the KDS: "just now", "7m", "1h 12m". */
export function formatElapsed(date, now = Date.now()) {
  const mins = minutesSince(date, now);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

export function formatTime(date) {
  if (!date) return '--:--';
  const d = new Date(date);
  if (!Number.isFinite(d.getTime())) return '--:--';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
