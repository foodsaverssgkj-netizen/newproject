export const colors = {
  navy: {
    900: '#0B1F3A',
    800: '#102A4C',
    700: '#173561',
    600: '#1F4378',
    500: '#2A5A99',
  },
  blue: {
    600: '#1E63D6',
    500: '#2A7FF0',
    400: '#3D8DF5',
    300: '#6BA9F8',
    200: '#A9CDFB',
    100: '#D6E8FD',
    50: '#EEF6FE',
  },
  neutral: {
    900: '#1A1F2C',
    800: '#2A3140',
    700: '#3D4658',
    600: '#5A6478',
    500: '#7C8499',
    400: '#A0A8BA',
    300: '#C7CDDA',
    200: '#E2E6EE',
    100: '#EFF2F7',
    50: '#F6F8FB',
    white: '#FFFFFF',
  },
  success: {
    600: '#1E8E4A',
    500: '#27AE60',
    400: '#3DCB76',
    100: '#D6F5E2',
    50: '#EAF8EF',
  },
  warning: {
    600: '#D68A00',
    500: '#F0A830',
    400: '#F5BD56',
    100: '#FCEFD4',
    50: '#FFF6E8',
  },
  error: {
    600: '#C42B2B',
    500: '#E03838',
    400: '#F05656',
    100: '#FBDCDC',
    50: '#FCEDED',
  },
  background: '#F6F8FB',
  surface: '#FFFFFF',
  text: {
    primary: '#0B1F3A',
    secondary: '#3D4658',
    tertiary: '#7C8499',
    inverse: '#FFFFFF',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const typography = {
  fontFamily: 'System',
  fontFamilyMedium: 'System',
  fontFamilyBold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    body: 22,
    heading: 28,
  },
} as const;

export const shadows = {
  card: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    shadowColor: '#0B1F3A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;
