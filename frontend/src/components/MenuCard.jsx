import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ImageOff, Plus } from 'lucide-react';
import { formatCurrency, toNumber } from '../lib/format';

/**
 * A single menu item.
 *
 * This was a `div` with an onClick — unreachable by keyboard and invisible to
 * screen readers. It is now a real button with a descriptive accessible name.
 */
function MenuCard({ item, onAdd, inCartQuantity = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const price = toNumber(item.price);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onAdd(item)}
      aria-label={`Add ${item.name}, ${formatCurrency(price)}, to the order${
        inCartQuantity > 0 ? `. ${inCartQuantity} already in order` : ''
      }`}
      className="group relative text-left bg-surface-raised border border-border rounded-2xl
                 overflow-hidden cursor-pointer transition-colors hover:border-brand
                 focus-ring shadow-[var(--shadow-card)] flex flex-col"
    >
      <div className="relative h-32 sm:h-40 bg-surface-sunken overflow-hidden shrink-0">
        {imageFailed || !item.image_url ? (
          <div className="w-full h-full flex items-center justify-center text-subtle">
            <ImageOff size={28} aria-hidden="true" />
          </div>
        ) : (
          <img
            src={item.image_url}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        <span
          className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full
                     text-xs sm:text-sm font-bold text-white"
        >
          {formatCurrency(price)}
        </span>

        {inCartQuantity > 0 && (
          <span
            className="absolute top-3 left-3 bg-brand text-brand-contrast min-w-[24px] h-6 px-1.5
                       rounded-full text-xs font-bold flex items-center justify-center"
          >
            {inCartQuantity}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-base text-text leading-tight">{item.name}</h3>
          <span
            aria-hidden="true"
            className="shrink-0 w-8 h-8 bg-brand-soft text-brand rounded-full flex items-center
                       justify-center transition-transform group-hover:scale-110"
          >
            <Plus size={18} />
          </span>
        </div>
        <p className="text-muted text-sm line-clamp-2">{item.description}</p>
      </div>
    </motion.button>
  );
}

export default MenuCard;
