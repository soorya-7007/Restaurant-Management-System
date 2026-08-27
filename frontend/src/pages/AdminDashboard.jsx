import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../ui/ThemeProvider';
import Card from '../ui/Card';
import StatCard from '../ui/StatCard';
import PageHeader from '../ui/PageHeader';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';
import AmbientGlow from '../ui/AmbientGlow';
import AIPredictor from '../components/AIPredictor';
import { formatCurrency } from '../lib/format';

/**
 * Demo figures. There is no analytics endpoint yet — /api/orders/analytics
 * returns a placeholder message — so these are clearly labelled as sample data
 * rather than presented as real numbers.
 */
const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8900 },
  { name: 'Sat', revenue: 11000 },
  { name: 'Sun', revenue: 9500 },
];

const itemData = [
  { name: 'Burger', sales: 145 },
  { name: 'Pizza', sales: 120 },
  { name: 'Latte', sales: 85 },
  { name: 'Fries', sales: 200 },
];

const KPIS = [
  { label: 'Total revenue', value: formatCurrency(44180), icon: IndianRupee, tone: 'success' },
  { label: 'Orders today', value: '142', icon: TrendingUp, tone: 'brand' },
  { label: 'Active customers', value: '89', icon: Users, tone: 'info' },
  {
    label: 'Low stock alerts',
    value: '2 items',
    icon: Package,
    tone: 'danger',
    emphasis: true,
  },
];

function DemoBadge() {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider bg-warning-soft text-warning px-2 py-0.5 rounded-full shrink-0">
      Demo data
    </span>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  // Recharts needs concrete values, so the palette follows the active theme —
  // the old hardcoded #1e1e2e tooltip was unreadable in light mode.
  const chart = useMemo(
    () => ({
      grid: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
      axis: isDark ? '#8b8ba7' : '#6b7280',
      brand: isDark ? '#a78bfa' : '#7c3aed',
      accent: isDark ? '#60a5fa' : '#2563eb',
      tooltipBg: isDark ? '#1f1f2e' : '#ffffff',
      tooltipBorder: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
      tooltipText: isDark ? '#f5f5f7' : '#1f2937',
      cursor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    }),
    [isDark]
  );

  const tooltipStyle = {
    backgroundColor: chart.tooltipBg,
    border: `1px solid ${chart.tooltipBorder}`,
    borderRadius: '12px',
    color: chart.tooltipText,
  };

  return (
    <div className="relative min-h-dvh bg-surface overflow-x-hidden">
      <AmbientGlow />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1600px] mx-auto">
        <PageHeader
          title="Analytics overview"
          subtitle={`Welcome back${user?.name ? `, ${user.name}` : ''}.`}
          icon={LayoutDashboard}
          className="mb-6"
        >
          <Link
            to="/pos"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl
                       border border-border bg-surface-raised text-text text-sm font-semibold
                       hover:bg-surface-hover transition-colors focus-ring"
          >
            Open POS
          </Link>
          <Link
            to="/kitchen"
            className="hidden sm:inline-flex items-center justify-center min-h-[44px] px-4 rounded-xl
                       border border-border bg-surface-raised text-text text-sm font-semibold
                       hover:bg-surface-hover transition-colors focus-ring"
          >
            Open kitchen
          </Link>
          <ThemeToggle />
          <Button variant="danger" icon={LogOut} onClick={logout}>
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </PageHeader>

        <div className="flex items-center gap-2 mb-5">
          <DemoBadge />
          <p className="text-xs text-subtle">
            Figures below are sample values — no analytics endpoint is wired up yet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {KPIS.map((kpi) => (
            <StatCard key={kpi.label} {...kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <Card className="xl:col-span-2 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-text">Weekly revenue trend</h2>
              <DemoBadge />
            </div>
            <figure className="flex-1 min-h-[260px] sm:min-h-[300px] w-full m-0">
              <figcaption className="sr-only">
                Area chart of revenue by weekday. Values range from{' '}
                {formatCurrency(2780)} on Thursday to {formatCurrency(11000)} on
                Saturday.
              </figcaption>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.brand} stopOpacity={0.45} />
                      <stop offset="95%" stopColor={chart.brand} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={chart.axis}
                    tick={{ fill: chart.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={chart.axis}
                    tick={{ fill: chart.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    itemStyle={{ color: chart.brand, fontWeight: 600 }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chart.brand}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </figure>
          </Card>

          <div className="xl:col-span-1">
            <AIPredictor />
          </div>

          <Card className="xl:col-span-3">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h2 className="text-lg font-bold text-text">Top selling items</h2>
              <DemoBadge />
            </div>
            <figure className="h-56 sm:h-64 w-full m-0">
              <figcaption className="sr-only">
                Bar chart of units sold per item. Fries lead with 200 units,
                followed by Burger at 145, Pizza at 120, and Latte at 85.
              </figcaption>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke={chart.axis}
                    tick={{ fill: chart.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke={chart.axis}
                    tick={{ fill: chart.axis, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: chart.cursor }}
                    formatter={(value) => [`${value} units`, 'Sold']}
                  />
                  <Bar
                    dataKey="sales"
                    fill={chart.accent}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </figure>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
