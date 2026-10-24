export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric', ...opts,
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const formatCurrency = (amount) => {
  if (amount == null || Number.isNaN(Number(amount))) return '—';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency', currency: 'PKR', maximumFractionDigits: 0,
  }).format(amount);
};

export const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

export const capitalize = (str = '') =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const avatarUrl = (src) => {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('blob:') || src.startsWith('data:')) return src;
  const base = (import.meta.env.VITE_STATIC_URL || '').replace(/\/$/, '');
  const normalized = src.replace(/\\/g, '/');
  const path = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${base}${path}`;
};

export const homePathForRole = (role) =>
  ['admin', 'hr'].includes(role) ? '/dashboard' : '/attendance';

export const statusColor = (status) => {
  const map = {
    active: 'bg-emerald-100 text-emerald-700',
    resigned: 'bg-amber-100 text-amber-700',
    terminated: 'bg-red-100 text-red-700',
    present: 'bg-emerald-100 text-emerald-700',
    absent: 'bg-red-100 text-red-700',
    late: 'bg-amber-100 text-amber-700',
    'half-day': 'bg-blue-100 text-blue-700',
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    paid: 'bg-emerald-100 text-emerald-700',
    draft: 'bg-slate-100 text-slate-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};
