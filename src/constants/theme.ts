// Tokens de DESIGN.md: ningún componente define colores, radios o duraciones por su cuenta.

export const colors = {
  ink: '#0A0A0A',
  ink2: '#171717',
  ink3: '#262626',
  canvas: '#ECECE9',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F3F1',
  border: '#E2E2DE',
  textPrimary: '#0A0A0A',
  textSecondary: '#6E6E6A',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#A1A1A1',
  navbarOverlay: 'rgba(10, 10, 10, 0.55)',

  blue: '#4F7BFF',
  purple: '#7B5CFA',
  magenta: '#C64FD6',
  red: '#F0435A',
  amber: '#F5A524',
  green: '#22B07D',
} as const;

export const gradients = {
  brand: [colors.blue, colors.purple, colors.magenta, colors.red],
  purpleLead: [colors.blue, colors.purple, colors.magenta],
  redLead: [colors.magenta, colors.red, colors.amber],
} as const;

export const gradientDirection = {
  start: { x: 0, y: 0 },
  end: { x: 1, y: 1 },
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34 },
  title: { fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 28 },
  heading: { fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  gutter: 20,
} as const;

export const radii = {
  sm: 12,
  md: 20,
  lg: 28,
  xl: 36,
  pill: 999,
} as const;

export const sizes = {
  button: 56,
  input: 56,
  textArea: 120,
  iconButton: 48,
  navItem: 52,
  chip: 36,
  touchTarget: 44,
  icon: 22,
  iconSmall: 16,
  iconStroke: 1.75,
} as const;

export const motion = {
  press: 120,
  chip: 150,
  segmented: 200,
  navbar: 220,
  enter: 250,
  emptyState: 300,
  staggerStep: 40,
  staggerMaxItems: 6,
  gradientLoop: 6000,
  gradientLoopLoading: 2000,
  pressScale: 0.97,
  enterScale: 0.95,
  // Curva ease-out fuerte: arranca rápido y frena suave, ideal para respuestas a input.
  easeOut: [0.23, 1, 0.32, 1],
} as const;

export const shadows = {
  navbar: {
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
