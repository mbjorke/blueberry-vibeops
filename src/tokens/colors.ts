// Base colors
export const baseColors = {
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  current: 'currentColor',
} as const;

// Semantic colors
export const semanticColors = {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--accent))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
} as const;

// Primary color palette
export const primaryColors = {
  DEFAULT: 'hsl(var(--primary))',
  foreground: 'hsl(var(--primary-foreground))',
  glow: 'hsl(var(--primary-glow))',
  50: 'hsl(var(--primary-50))',
  100: 'hsl(var(--primary-100))',
  200: 'hsl(var(--primary-200))',
  300: 'hsl(var(--primary-300))',
  400: 'hsl(var(--primary-400))',
  500: 'hsl(var(--primary-500))',
  600: 'hsl(var(--primary-600))',
  700: 'hsl(var(--primary-700))',
  800: 'hsl(var(--primary-800))',
  900: 'hsl(var(--primary-900))',
  950: 'hsl(var(--primary-950))',
} as const;

// Secondary color palette
export const secondaryColors = {
  DEFAULT: 'hsl(var(--secondary))',
  foreground: 'hsl(var(--secondary-foreground))',
  50: 'hsl(var(--secondary-50))',
  100: 'hsl(var(--secondary-100))',
  200: 'hsl(var(--secondary-200))',
  300: 'hsl(var(--secondary-300))',
  400: 'hsl(var(--secondary-400))',
  500: 'hsl(var(--secondary-500))',
  600: 'hsl(var(--secondary-600))',
  700: 'hsl(var(--secondary-700))',
  800: 'hsl(var(--secondary-800))',
  900: 'hsl(var(--secondary-900))',
} as const;

// Status colors
export const statusColors = {
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  success: {
    DEFAULT: 'hsl(var(--success))',
    foreground: 'hsl(var(--success-foreground))',
  },
  warning: {
    DEFAULT: 'hsl(var(--warning))',
    foreground: 'hsl(var(--warning-foreground))',
  },
  info: {
    DEFAULT: 'hsl(var(--info))',
    foreground: 'hsl(var(--info-foreground))',
  },
} as const;

// UI colors
export const uiColors = {
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))',
  },
} as const;

// Sidebar colors
export const sidebarColors = {
  DEFAULT: 'hsl(var(--sidebar-background))',
  foreground: 'hsl(var(--sidebar-foreground))',
  primary: 'hsl(var(--sidebar-primary))',
  'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  accent: 'hsl(var(--sidebar-accent))',
  'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  border: 'hsl(var(--sidebar-border))',
  ring: 'hsl(var(--sidebar-ring))',
} as const;

// Combined colors object for Tailwind
export const colors = {
  ...baseColors,
  ...semanticColors,
  primary: primaryColors,
  secondary: secondaryColors,
  ...statusColors,
  ...uiColors,
  sidebar: sidebarColors,
} as const;
