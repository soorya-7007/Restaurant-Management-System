import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  Coffee,
  LogOut,
  Monitor,
  Moon,
  Printer,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  UtensilsCrossed,
  WifiOff,
  X,
} from 'lucide-react';
import api, { errorMessage } from '../lib/api';
import { MENU_CATEGORIES, TABLES, computeTotals } from '../lib/constants';
import { formatCurrencyCompact, toNumber } from '../lib/format';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../ui/ThemeProvider';
import { useToast } from '../ui/Toast';
import Button, { IconButton } from '../ui/Button';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import AmbientGlow from '../ui/AmbientGlow';
import { MenuCardSkeleton } from '../ui/Skeleton';
import MenuCard from '../components/MenuCard';
import CartPanel from '../components/CartPanel';
import CheckoutModal from '../components/CheckoutModal';

const ORDER_TYPES = ['Dine In', 'Takeaway'];

const MOCK_NOTIFICATIONS = [
  { id: 1, message: 'Order #12 is ready for pickup', time: '2m ago', type: 'success' },
  { id: 2, message: 'Table 5 requested the bill', time: '5m ago', type: 'info' },
  { id: 3, message: 'Low stock: Beef Patties', time: '1h ago', type: 'warning' },
];

function WaiterPOS() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const toast = useToast();

  const [menuItems, setMenuItems] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState(TABLES[0]);
  const [orderType, setOrderType] = useState('Dine In');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const searchRef = useRef(null);

  const fetchMenu = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const { data } = await api.get('/menu');
      setMenuItems(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (error) {
      setLoadError(errorMessage(error, 'Could not load the menu'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Debounce the search so filtering doesn't run on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim().toLowerCase()), 200);
    return () => clearTimeout(id);
  }, [searchInput]);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!search) return true;
      // The search box previously had no onChange at all and filtered nothing.
      return (
        item.name?.toLowerCase().includes(search) ||
        item.description?.toLowerCase().includes(search)
      );
    });
  }, [menuItems, activeCategory, search]);

  const quantityById = useMemo(
    () => Object.fromEntries(cart.map((item) => [item.id, item.quantity])),
    [cart]
  );

  const { subtotal, tax, total } = useMemo(() => {
    const sum = cart.reduce(
      (acc, item) => acc + toNumber(item.price) * item.quantity,
      0
    );
    return computeTotals(sum);
  }, [cart]);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = useCallback(
    (item) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...item, quantity: 1, notes: '' }];
      });
      toast.success(`${item.name} added`, { duration: 1600 });
    },
    [toast]
  );

  /** Removes a row and offers an undo, so a mis-tap isn't destructive. */
  const removeFromCart = useCallback(
    (id) => {
      setCart((prev) => {
        const index = prev.findIndex((i) => i.id === id);
        if (index === -1) return prev;
        const removed = prev[index];
        toast.toast({
          title: `${removed.name} removed`,
          tone: 'info',
          action: {
            label: 'Undo',
            onClick: () =>
              setCart((current) => {
                if (current.some((i) => i.id === removed.id)) return current;
                const restored = [...current];
                restored.splice(Math.min(index, restored.length), 0, removed);
                return restored;
              }),
          },
        });
        return prev.filter((i) => i.id !== id);
      });
    },
    [toast]
  );

  /** Stepping below 1 removes the row instead of silently doing nothing. */
  const changeQuantity = useCallback(
    (id, delta) => {
      const current = cart.find((i) => i.id === id);
      if (!current) return;
      if (current.quantity + delta < 1) {
        removeFromCart(id);
        return;
      }
      setCart((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
      );
    },
    [cart, removeFromCart]
  );

  const setNotes = useCallback((id, notes) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  }, []);

  const clearCart = useCallback(() => {
    const snapshot = cart;
    setCart([]);
    toast.toast({
      title: 'Order cleared',
      tone: 'info',
      action: { label: 'Undo', onClick: () => setCart(snapshot) },
    });
  }, [cart, toast]);

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0) return false;
    setPlacingOrder(true);
    try {
      await api.post('/orders', {
        branch_id: 1,
        // Sends the table the waiter actually chose — this used to be
        // hardcoded to 'Table 4' regardless of the UI.
        table_number: orderType === 'Takeaway' ? 'Takeaway' : tableNumber,
        items: cart.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          price: toNumber(item.price),
          notes: item.notes?.trim() || null,
        })),
        total_amount: total,
      });
      setCart([]);
      setIsCartOpen(false);
      toast.success('Order sent to the kitchen', {
        description: `${itemCount} ${itemCount === 1 ? 'item' : 'items'} • ${
          orderType === 'Takeaway' ? 'Takeaway' : tableNumber
        }`,
      });
      return true;
    } catch (error) {
      toast.error('Could not place the order', {
        description: errorMessage(error),
      });
      return false;
    } finally {
      setPlacingOrder(false);
    }
  }, [cart, orderType, tableNumber, total, itemCount, toast]);

  const openCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const cartProps = {
    cart,
    subtotal,
    tax,
    total,
    tableLabel: orderType === 'Takeaway' ? 'Takeaway' : tableNumber,
    orderType,
    onQuantityChange: changeQuantity,
    onRemove: removeFromCart,
    onNotesChange: setNotes,
    onClear: clearCart,
    onCheckout: openCheckout,
    placingOrder,
  };

  const navItems = [
    { icon: Coffee, label: 'Menu', active: true, onClick: () => {} },
    {
      icon: Bell,
      label: 'Notifications',
      badge: true,
      onClick: () => setIsNotifOpen(true),
    },
    { icon: Settings, label: 'Settings', onClick: () => setIsSettingsOpen(true) },
  ];

  return (
    <div className="relative min-h-dvh lg:h-dvh flex flex-col lg:flex-row bg-surface overflow-hidden">
      <AmbientGlow />

      {/* Vertical rail on tablet and up; a bottom tab bar replaces it on phones. */}
      <nav
        aria-label="Main navigation"
        className="hidden md:flex md:w-20 shrink-0 flex-col items-center gap-6 py-6
                   border-r border-border bg-surface-raised/70 backdrop-blur-xl z-20 relative"
      >
        <div
          className="w-11 h-11 bg-brand rounded-2xl flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <UtensilsCrossed className="text-brand-contrast" size={22} />
        </div>
        {navItems.map((item) => (
          <div key={item.label} className="relative">
            <IconButton
              icon={item.icon}
              label={item.label}
              active={item.active}
              onClick={item.onClick}
              size={22}
            />
            {item.badge && (
              <span
                aria-hidden="true"
                className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface-raised"
              />
            )}
          </div>
        ))}
        <div className="mt-auto">
          <IconButton
            icon={isDark ? Sun : Moon}
            label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
            size={20}
          />
        </div>
      </nav>

      {/* Menu column */}
      <main className="flex-1 flex flex-col min-w-0 z-10 relative overflow-hidden">
        <header className="px-4 sm:px-6 lg:px-8 pt-5 lg:pt-7 shrink-0">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">
                  Point of Sale
                </h1>
                <p className="text-muted text-sm mt-0.5 truncate">
                  {user?.name ? `Signed in as ${user.name}` : 'Take orders seamlessly'}
                </p>
              </div>
              {/* Phone-only controls, since the rail is hidden below md. */}
              <div className="flex md:hidden items-center gap-1 shrink-0">
                <IconButton
                  icon={isDark ? Sun : Moon}
                  label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  onClick={toggleTheme}
                  size={20}
                />
                <IconButton
                  icon={Settings}
                  label="Settings"
                  onClick={() => setIsSettingsOpen(true)}
                  size={20}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 xl:shrink-0">
              <div className="relative flex-1 sm:w-64 xl:w-72">
                <Search
                  size={18}
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                />
                <input
                  ref={searchRef}
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search menu…"
                  aria-label="Search the menu by name or description"
                  className="w-full bg-surface-raised border border-border rounded-xl py-2.5 pl-11 pr-10
                             text-text placeholder:text-subtle focus-ring min-h-[44px]
                             hover:border-border-strong transition-colors
                             [&::-webkit-search-cancel-button]:hidden"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      searchRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-subtle
                               hover:text-text transition-colors focus-ring rounded-lg"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <label className="sr-only" htmlFor="pos-table">
                  Table
                </label>
                <select
                  id="pos-table"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  disabled={orderType === 'Takeaway'}
                  className="flex-1 sm:flex-none bg-surface-raised border border-border rounded-xl
                             px-3 py-2.5 text-sm font-medium text-text focus-ring min-h-[44px]
                             hover:border-border-strong transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {TABLES.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
                </select>

                <div
                  role="group"
                  aria-label="Order type"
                  className="flex bg-surface-raised border border-border rounded-xl p-1 shrink-0"
                >
                  {ORDER_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setOrderType(type)}
                      aria-pressed={orderType === type}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors focus-ring whitespace-nowrap ${
                        orderType === type
                          ? 'bg-brand text-brand-contrast'
                          : 'text-muted hover:text-text'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category filter — scrolls horizontally rather than wrapping on phones. */}
          <div
            role="group"
            aria-label="Filter by category"
            className="flex gap-2 mt-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar"
          >
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap
                            transition-colors focus-ring min-h-[44px] shrink-0 ${
                              activeCategory === cat
                                ? 'bg-brand text-brand-contrast'
                                : 'bg-surface-raised text-muted border border-border hover:text-text hover:border-border-strong'
                            }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 sm:px-6 lg:px-8 py-5 pb-28 lg:pb-8">
          {status === 'loading' && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <MenuCardSkeleton key={i} />
              ))}
            </div>
          )}

          {status === 'error' && (
            <EmptyState
              icon={WifiOff}
              tone="error"
              title="Couldn't load the menu"
              description={loadError}
              action={fetchMenu}
              actionLabel="Try again"
            />
          )}

          {status === 'ready' && filteredItems.length === 0 && (
            <EmptyState
              icon={Search}
              title="No matching dishes"
              description={
                search
                  ? `Nothing matches "${searchInput}"${
                      activeCategory !== 'All' ? ` in ${activeCategory}` : ''
                    }.`
                  : `There are no items in ${activeCategory} yet.`
              }
              action={
                search || activeCategory !== 'All'
                  ? () => {
                      setSearchInput('');
                      setActiveCategory('All');
                    }
                  : undefined
              }
              actionLabel="Clear filters"
            />
          )}

          {status === 'ready' && filteredItems.length > 0 && (
            <>
              <p aria-live="polite" className="sr-only">
                {filteredItems.length} dishes shown
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item) => (
                    <MenuCard
                      key={item.id}
                      item={item}
                      onAdd={addToCart}
                      inCartQuantity={quantityById[item.id] ?? 0}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Cart as a sidebar from lg up. */}
      <aside
        aria-label="Current order"
        className="hidden lg:flex w-[350px] xl:w-[400px] shrink-0 flex-col border-l border-border
                   bg-surface-raised/70 backdrop-blur-xl p-6 z-10 relative"
      >
        <CartPanel {...cartProps} />
      </aside>

      {/* Phone/tablet: sticky summary bar that opens the cart as a sheet. */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface-raised/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-2 p-3">
          <nav aria-label="Main navigation" className="flex md:hidden gap-1 shrink-0">
            <div className="relative">
              <IconButton
                icon={Bell}
                label="Notifications"
                onClick={() => setIsNotifOpen(true)}
                size={20}
              />
              <span
                aria-hidden="true"
                className="absolute top-2 right-2 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface-raised"
              />
            </div>
          </nav>

          <Button
            fullWidth
            size="lg"
            icon={ShoppingBag}
            onClick={() => setIsCartOpen(true)}
            disabled={cart.length === 0}
            className="flex-1"
          >
            {cart.length === 0 ? (
              'Cart is empty'
            ) : (
              <>
                {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                {formatCurrencyCompact(total)}
              </>
            )}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Current order"
        icon={ShoppingBag}
        size="md"
      >
        <div className="h-[65dvh]">
          <CartPanel {...cartProps} />
        </div>
      </Modal>

      <Modal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        title="Notifications"
        icon={Bell}
      >
        <ul className="flex flex-col gap-3">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <li
              key={notif.id}
              className="bg-surface border border-border rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  aria-hidden="true"
                  className={`w-2 h-2 rounded-full ${
                    notif.type === 'success'
                      ? 'bg-success'
                      : notif.type === 'warning'
                        ? 'bg-warning'
                        : 'bg-info'
                  }`}
                />
                <span className="text-xs text-subtle font-medium">{notif.time}</span>
              </div>
              <p className="text-sm font-medium text-text">{notif.message}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-subtle text-center mt-4">
          Demo notifications — not yet wired to live events.
        </p>
      </Modal>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
        icon={Settings}
      >
        <div className="flex flex-col gap-3">
          <SettingsRow
            icon={Monitor}
            tone="bg-brand-soft text-brand"
            title="POS terminal setup"
            subtitle="Configure device & pairing"
            onClick={() =>
              toast.info('Terminal pairing', {
                description: 'Pairing mode is not available in this demo build.',
              })
            }
          />
          <SettingsRow
            icon={Printer}
            tone="bg-info-soft text-info"
            title="Receipt printer"
            subtitle="Epson TM-T88VI connected"
            onClick={() =>
              toast.info('Receipt printer', {
                description: 'Printer configuration is not available in this demo build.',
              })
            }
          />

          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={isDark}
            className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border
                       bg-surface hover:bg-surface-hover transition-colors focus-ring text-left"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="p-2 rounded-lg bg-warning-soft text-warning shrink-0">
                {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-text">Appearance</p>
                <p className="text-sm text-muted">
                  {isDark ? 'Dark mode active' : 'Light mode active'}
                </p>
              </div>
            </div>
            <span
              aria-hidden="true"
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${
                isDark ? 'bg-brand justify-end' : 'bg-border-strong justify-start'
              }`}
            >
              <motion.span layout className="w-4 h-4 bg-white rounded-full block" />
            </span>
          </button>

          <Button
            variant="danger"
            size="lg"
            fullWidth
            icon={LogOut}
            onClick={logout}
            className="mt-3"
          >
            Sign out
          </Button>
        </div>
      </Modal>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        total={total}
        itemCount={itemCount}
        items={cart}
        onPaymentSuccess={handlePlaceOrder}
      />
    </div>
  );
}

function SettingsRow({ icon: Icon, tone, title, subtitle, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border
                 bg-surface hover:bg-surface-hover transition-colors focus-ring text-left"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`p-2 rounded-lg shrink-0 ${tone}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-text">{title}</p>
          <p className="text-sm text-muted truncate">{subtitle}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-subtle shrink-0" aria-hidden="true" />
    </button>
  );
}

export default WaiterPOS;
