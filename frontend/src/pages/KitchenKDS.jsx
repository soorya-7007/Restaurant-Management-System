import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Flame,
  Inbox,
  LogOut,
  NotebookPen,
  RefreshCw,
  Wifi,
  WifiOff,
} from 'lucide-react';
import io from 'socket.io-client';
import api, { SOCKET_URL, errorMessage } from '../lib/api';
import {
  KDS_LATE_AFTER_MIN,
  KDS_WARN_AFTER_MIN,
  ORDER_STATUSES,
  STORAGE_KEYS,
} from '../lib/constants';
import { formatElapsed, formatTime, minutesSince } from '../lib/format';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../ui/Toast';
import Button, { IconButton } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import EmptyState from '../ui/EmptyState';
import { TicketSkeleton } from '../ui/Skeleton';
import { Spinner } from '../ui/Spinner';

const NEXT_STATUS = { New: 'Preparing', Preparing: 'Ready' };
const ACTION_LABEL = { New: 'Start preparing', Preparing: 'Mark ready' };

const COLUMN_TONE = {
  New: 'text-info',
  Preparing: 'text-warning',
  Ready: 'text-success',
};

/** Age-based urgency so a late ticket is obvious across a kitchen. */
function urgency(minutes, status) {
  if (status === 'Ready') return { border: 'border-success/40', text: 'text-success' };
  if (minutes >= KDS_LATE_AFTER_MIN)
    return { border: 'border-danger', text: 'text-danger', late: true };
  if (minutes >= KDS_WARN_AFTER_MIN)
    return { border: 'border-warning/60', text: 'text-warning' };
  return { border: 'border-border', text: 'text-muted' };
}

function Ticket({ order, now, onAdvance, pending, isFresh }) {
  const status = order.status || 'New';
  const minutes = minutesSince(order.createdAt, now);
  const tone = urgency(minutes, status);
  const items = order.OrderItems ?? [];
  const next = NEXT_STATUS[status];

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`bg-surface-raised border-2 rounded-2xl p-4 shadow-[var(--shadow-card)] ${tone.border} ${
        isFresh ? 'animate-pulse' : ''
      }`}
    >
      <div className="flex justify-between items-start gap-3 pb-3 mb-3 border-b border-border">
        <div className="min-w-0">
          <h3 className="font-bold text-base text-text">Order #{order.id}</h3>
          <p className="text-muted text-sm mt-0.5 truncate">
            {order.table_number || 'Unassigned'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className={`flex items-center gap-1 text-sm font-bold ${tone.text}`}>
            <Clock size={13} aria-hidden="true" />
            <span>{formatElapsed(order.createdAt, now)}</span>
          </p>
          <p className="text-xs text-subtle mt-0.5">{formatTime(order.createdAt)}</p>
        </div>
      </div>

      {tone.late && status !== 'Ready' && (
        <p className="text-xs font-bold text-danger mb-2.5 uppercase tracking-wide">
          Overdue
        </p>
      )}

      {items.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id} className="text-sm">
              <div className="flex justify-between gap-2 text-text">
                {/* Dish names come from the nested MenuItem include — this used
                    to render as "2x Item #7". */}
                <span className="font-medium">
                  <span className="text-brand font-bold">{item.quantity}×</span>{' '}
                  {item.MenuItem?.name ?? `Item #${item.menu_item_id}`}
                </span>
              </div>
              {item.notes && (
                <p className="flex items-start gap-1.5 text-xs text-warning mt-1 font-medium">
                  <NotebookPen size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {item.notes}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-subtle italic mb-4">No item details available</p>
      )}

      {next && (
        <Button
          fullWidth
          variant={status === 'New' ? 'secondary' : 'success'}
          icon={status === 'Preparing' ? CheckCircle : Flame}
          loading={pending}
          onClick={() => onAdvance(order, next)}
        >
          {ACTION_LABEL[status]}
        </Button>
      )}
    </motion.li>
  );
}

function KitchenKDS() {
  const { user, logout } = useAuth();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [loadError, setLoadError] = useState('');
  const [connected, setConnected] = useState(false);
  const [pendingIds, setPendingIds] = useState([]);
  const [freshIds, setFreshIds] = useState([]);
  // Phone/tablet: one column at a time via tabs.
  const [activeTab, setActiveTab] = useState('New');
  // Drives the ticket-age countdown.
  const [now, setNow] = useState(() => Date.now());

  const socketRef = useRef(null);

  const fetchOrders = useCallback(async () => {
    setStatus('loading');
    setLoadError('');
    try {
      const { data } = await api.get('/orders');
      setOrders(Array.isArray(data) ? data : []);
      setStatus('ready');
    } catch (error) {
      setLoadError(errorMessage(error, 'Could not load orders'));
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Re-render once a minute so ticket ages stay accurate.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  /**
   * The socket used to be constructed at module scope, so it connected on
   * import for every role and was never torn down. It now lives in an effect
   * with a real disconnect, and joins the kitchen room on every (re)connect.
   */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem(STORAGE_KEYS.token) },
    });
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit('joinKitchen');
    };
    const onDisconnect = () => setConnected(false);

    const onNewOrder = (order) => {
      setOrders((prev) =>
        prev.some((o) => o.id === order.id) ? prev : [order, ...prev]
      );
      setFreshIds((prev) => [...prev, order.id]);
      setTimeout(
        () => setFreshIds((prev) => prev.filter((id) => id !== order.id)),
        6000
      );
    };

    // The server already emitted this; the KDS never listened, so two kitchen
    // screens could disagree about a ticket's status.
    const onOrderUpdated = (order) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: order.status } : o))
      );
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('newOrder', onNewOrder);
    socket.on('orderUpdated', onOrderUpdated);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('newOrder', onNewOrder);
      socket.off('orderUpdated', onOrderUpdated);
      socket.disconnect();
    };
  }, []);

  const updateStatus = useCallback(async (orderId, nextStatus) => {
    setPendingIds((prev) => [...prev, orderId]);
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );
      return true;
    } catch (error) {
      toast.error('Could not update the order', { description: errorMessage(error) });
      return false;
    } finally {
      setPendingIds((prev) => prev.filter((id) => id !== orderId));
    }
  }, [toast]);

  /** Advances a ticket, with an undo for the inevitable mis-tap. */
  const advance = useCallback(
    async (order, nextStatus) => {
      const previous = order.status || 'New';
      const ok = await updateStatus(order.id, nextStatus);
      if (!ok) return;
      toast.toast({
        title: `Order #${order.id} → ${nextStatus}`,
        tone: 'success',
        action: {
          label: 'Undo',
          onClick: () => updateStatus(order.id, previous),
        },
      });
    },
    [updateStatus, toast]
  );

  const byStatus = useMemo(() => {
    const groups = { New: [], Preparing: [], Ready: [] };
    for (const order of orders) {
      const key = order.status || 'New';
      if (groups[key]) groups[key].push(order);
    }
    return groups;
  }, [orders]);

  const overdueCount = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.status || 'New') !== 'Ready' &&
          minutesSince(o.createdAt, now) >= KDS_LATE_AFTER_MIN
      ).length,
    [orders, now]
  );

  const renderColumnBody = (columnStatus) => {
    const list = byStatus[columnStatus];

    if (status === 'loading') {
      return (
        <div className="flex flex-col gap-3">
          <TicketSkeleton />
          <TicketSkeleton />
        </div>
      );
    }

    if (status === 'error') {
      return (
        <EmptyState
          icon={WifiOff}
          tone="error"
          title="Couldn't load orders"
          description={loadError}
          action={fetchOrders}
          actionLabel="Retry"
        />
      );
    }

    if (list.length === 0) {
      return (
        <EmptyState
          icon={Inbox}
          title={
            columnStatus === 'New'
              ? 'No new orders'
              : columnStatus === 'Preparing'
                ? 'Nothing on the line'
                : 'Nothing waiting for pickup'
          }
          description={
            columnStatus === 'New' ? 'New tickets appear here automatically.' : undefined
          }
        />
      );
    }

    return (
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {list.map((order) => (
            <Ticket
              key={order.id}
              order={order}
              now={now}
              onAdvance={advance}
              pending={pendingIds.includes(order.id)}
              isFresh={freshIds.includes(order.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
    );
  };

  return (
    <div className="min-h-dvh lg:h-dvh flex flex-col bg-surface">
      <header className="shrink-0 px-4 sm:px-6 lg:px-8 pt-5 pb-4 border-b border-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text flex items-center gap-2.5">
              <Flame className="text-warning shrink-0" aria-hidden="true" />
              <span className="truncate">Kitchen Display</span>
            </h1>
            <p className="text-muted text-sm mt-0.5 truncate">
              {user?.name ? `Chef ${user.name}` : 'Live order queue'}
              {overdueCount > 0 && (
                <>
                  {' • '}
                  <span className="text-danger font-semibold">
                    {overdueCount} overdue
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Without this, a dropped socket silently stopped new orders. */}
            <span
              role="status"
              aria-live="polite"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                connected
                  ? 'bg-success-soft text-success'
                  : 'bg-warning-soft text-warning'
              }`}
            >
              {connected ? (
                <>
                  <Wifi size={13} aria-hidden="true" /> Live
                </>
              ) : (
                <>
                  <Spinner size={13} label="" /> Reconnecting
                </>
              )}
            </span>
            <IconButton
              icon={RefreshCw}
              label="Refresh orders"
              onClick={fetchOrders}
              size={18}
            />
            <ThemeToggle />
            <IconButton icon={LogOut} label="Sign out" variant="danger" onClick={logout} size={18} />
          </div>
        </div>

        {/* Mobile status tabs — the old fixed-height 3-column grid broke
            scrolling entirely on small screens. */}
        <div
          role="tablist"
          aria-label="Order status"
          className="flex lg:hidden gap-2 mt-4 overflow-x-auto custom-scrollbar -mx-4 px-4"
        >
          {ORDER_STATUSES.map((columnStatus) => (
            <button
              key={columnStatus}
              role="tab"
              type="button"
              aria-selected={activeTab === columnStatus}
              onClick={() => setActiveTab(columnStatus)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold
                          whitespace-nowrap transition-colors focus-ring min-h-[44px] shrink-0 ${
                            activeTab === columnStatus
                              ? 'bg-brand text-brand-contrast'
                              : 'bg-surface-raised text-muted border border-border'
                          }`}
            >
              {columnStatus}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === columnStatus ? 'bg-black/20' : 'bg-surface-hover'
                }`}
              >
                {byStatus[columnStatus].length}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Desktop: three parallel columns. Mobile: the selected tab only. */}
      <div className="flex-1 min-h-0 px-4 sm:px-6 lg:px-8 py-5 overflow-hidden">
        <div className="hidden lg:grid grid-cols-3 gap-6 h-full">
          {ORDER_STATUSES.map((columnStatus) => (
            <section
              key={columnStatus}
              aria-label={`${columnStatus} orders`}
              className="bg-surface-raised/60 border border-border rounded-2xl p-4 flex flex-col min-h-0"
            >
              <h2 className="text-base font-bold mb-4 flex items-center justify-between shrink-0">
                <span className={COLUMN_TONE[columnStatus]}>{columnStatus}</span>
                <span className="text-xs bg-surface-hover text-muted px-2.5 py-1 rounded-full">
                  {byStatus[columnStatus].length}
                </span>
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 -mx-1 px-1">
                {renderColumnBody(columnStatus)}
              </div>
            </section>
          ))}
        </div>

        <div className="lg:hidden h-full overflow-y-auto custom-scrollbar">
          {renderColumnBody(activeTab)}
        </div>
      </div>

      {!connected && (
        <p
          role="status"
          className="sm:hidden shrink-0 text-center text-xs font-semibold text-warning bg-warning-soft py-2"
        >
          Reconnecting to the kitchen feed…
        </p>
      )}
    </div>
  );
}

export default KitchenKDS;
