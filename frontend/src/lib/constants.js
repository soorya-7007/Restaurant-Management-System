/**
 * Sales tax applied at checkout.
 *
 * Previously duplicated as a bare `* 1.08` in three separate places. The rate
 * itself is unchanged from the original code. Note that 8% alongside ₹ pricing
 * is unusual — Indian restaurant GST is typically 5% — so if that was the
 * intent, this is the single line to change.
 */
export const TAX_RATE = 0.08;

export const TAX_LABEL = `Tax (${Math.round(TAX_RATE * 100)}%)`;

/** Ticket age thresholds (minutes) that drive KDS urgency colours. */
export const KDS_WARN_AFTER_MIN = 10;
export const KDS_LATE_AFTER_MIN = 20;

export const ORDER_STATUSES = ['New', 'Preparing', 'Ready'];

/** Tables a waiter can assign an order to. */
export const TABLES = Array.from({ length: 12 }, (_, i) => `Table ${i + 1}`);

export const MENU_CATEGORIES = ['All', 'Mains', 'Sides', 'Desserts', 'Drinks'];

export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  theme: 'theme',
};

export function computeTotals(subtotal) {
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}
