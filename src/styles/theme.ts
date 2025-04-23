export const theme = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
    },
  },
  spacing: {
    page: {
      x: 'px-4 md:px-6 lg:px-8',
      y: 'py-6 md:py-8 lg:py-10',
    },
    section: {
      x: 'px-4 md:px-6',
      y: 'py-4 md:py-6',
    },
    card: {
      x: 'px-4',
      y: 'py-4',
    },
  },
  typography: {
    title: 'text-3xl font-bold text-secondary-900',
    subtitle: 'text-xl font-semibold text-secondary-800',
    body: 'text-base text-secondary-700',
    small: 'text-sm text-secondary-600',
  },
  components: {
    card: 'bg-background-primary rounded-xl shadow-sm border border-secondary-200',
    cardHover: 'hover:shadow-md transition-shadow duration-200',
    badge: 'rounded-full px-3 py-1 text-sm font-medium',
    button: {
      base: 'rounded-lg px-4 py-2 font-medium transition-colors duration-200',
      primary: 'bg-primary-600 text-white hover:bg-primary-700',
      secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200',
      success: 'bg-success-500 text-white hover:bg-success-600',
      warning: 'bg-warning-500 text-white hover:bg-warning-600',
      error: 'bg-error-500 text-white hover:bg-error-600',
    },
  },
} as const;

export type Theme = typeof theme; 