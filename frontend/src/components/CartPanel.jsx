import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CreditCard,
  ImageOff,
  Minus,
  NotebookPen,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import Button, { IconButton } from '../ui/Button';
import EmptyState from '../ui/EmptyState';
import { formatCurrency, toNumber } from '../lib/format';
import { TAX_LABEL } from '../lib/constants';

function CartRow({ item, onQuantityChange, onRemove, onNotesChange }) {
  const [notesOpen, setNotesOpen] = useState(Boolean(item.notes));
  const price = toNumber(item.price);
  const lineTotal = price * item.quantity;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.18 }}
      className="bg-surface border border-border p-3 rounded-2xl"
    >
      <div className="flex gap-3 items-center">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt=""
            loading="lazy"
            className="w-14 h-14 rounded-xl object-cover shrink-0 bg-surface-sunken"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-surface-sunken flex items-center justify-center text-subtle shrink-0">
            <ImageOff size={18} aria-hidden="true" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-text leading-tight truncate">
            {item.name}
          </h4>
          <p className="text-brand font-bold text-sm mt-0.5">
            {formatCurrency(lineTotal)}
          </p>
          {item.quantity > 1 && (
            <p className="text-xs text-subtle">{formatCurrency(price)} each</p>
          )}
        </div>

        <div className="flex items-center gap-1 bg-surface-raised border border-border rounded-full shrink-0">
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, -1)}
            aria-label={
              item.quantity === 1
                ? `Remove ${item.name} from order`
                : `Decrease ${item.name} quantity`
            }
            className="p-2 text-muted hover:text-brand transition-colors focus-ring rounded-full"
          >
            {/* At quantity 1 this removes the row — it used to silently do nothing. */}
            {item.quantity === 1 ? (
              <Trash2 size={14} aria-hidden="true" />
            ) : (
              <Minus size={14} aria-hidden="true" />
            )}
          </button>
          <span
            aria-label={`Quantity ${item.quantity}`}
            className="w-5 text-center font-semibold text-sm text-text tabular-nums"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantityChange(item.id, 1)}
            aria-label={`Increase ${item.name} quantity`}
            className="p-2 text-muted hover:text-brand transition-colors focus-ring rounded-full"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>

        <IconButton
          icon={X}
          label={`Remove ${item.name} from order`}
          variant="danger"
          size={16}
          onClick={() => onRemove(item.id)}
          className="shrink-0 min-h-[36px] min-w-[36px]"
        />
      </div>

      <div className="mt-2">
        {notesOpen ? (
          <input
            type="text"
            value={item.notes ?? ''}
            onChange={(e) => onNotesChange(item.id, e.target.value)}
            placeholder="e.g. no onions, extra spicy"
            aria-label={`Kitchen note for ${item.name}`}
            maxLength={120}
            className="w-full text-xs bg-surface-raised border border-border rounded-lg px-3 py-2
                       text-text placeholder:text-subtle focus-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => setNotesOpen(true)}
            className="text-xs text-subtle hover:text-brand transition-colors flex items-center gap-1.5 focus-ring rounded"
          >
            <NotebookPen size={12} aria-hidden="true" /> Add note for kitchen
          </button>
        )}
      </div>
    </motion.li>
  );
}

/**
 * The order cart. Rendered inline as a sidebar on large screens and inside a
 * bottom sheet on phones, so the markup lives here rather than in the page.
 */
function CartPanel({
  cart,
  subtotal,
  tax,
  total,
  tableLabel,
  orderType,
  onQuantityChange,
  onRemove,
  onNotesChange,
  onClear,
  onCheckout,
  placingOrder = false,
}) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-text">Current order</h2>
          <p className="text-muted text-sm truncate">
            {tableLabel} • {orderType}
            {itemCount > 0 && (
              <>
                {' • '}
                <span className="text-brand font-semibold">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </>
            )}
          </p>
        </div>
        {cart.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-semibold text-muted hover:text-danger transition-colors focus-ring rounded px-1 shrink-0"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 -mx-1 px-1">
        {cart.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No items yet"
            description="Tap a dish from the menu to start building this order."
            className="h-full"
          />
        ) : (
          <ul className="flex flex-col gap-2.5 pb-2">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <CartRow
                  key={item.id}
                  item={item}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemove}
                  onNotesChange={onNotesChange}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <div className="pt-4 mt-3 border-t border-border shrink-0">
        <dl className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Subtotal</dt>
            <dd className="font-medium text-text tabular-nums">
              {formatCurrency(subtotal)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{TAX_LABEL}</dt>
            <dd className="font-medium text-text tabular-nums">{formatCurrency(tax)}</dd>
          </div>
          <div className="flex justify-between pt-2 border-t border-border text-lg font-bold">
            <dt className="text-text">Total</dt>
            <dd className="text-brand tabular-nums">{formatCurrency(total)}</dd>
          </div>
        </dl>

        <Button
          size="lg"
          fullWidth
          icon={CreditCard}
          onClick={onCheckout}
          disabled={cart.length === 0}
          loading={placingOrder}
        >
          {cart.length === 0 ? 'Add items to continue' : 'Proceed to payment'}
        </Button>
      </div>
    </div>
  );
}

export default CartPanel;
