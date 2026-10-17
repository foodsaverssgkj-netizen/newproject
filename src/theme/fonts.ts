import { colors, typography } from './tokens';
import { StyleSheet } from 'react-native';

export const fontStyles = StyleSheet.create({
  display: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.display,
    lineHeight: typography.lineHeight.heading,
    color: colors.text.primary,
  },
  h1: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxxl,
    lineHeight: typography.lineHeight.heading,
    color: colors.text.primary,
  },
  h2: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxl,
    lineHeight: typography.lineHeight.heading,
    color: colors.text.primary,
  },
  h3: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xl,
    lineHeight: 24,
    color: colors.text.primary,
  },
  h4: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    lineHeight: 24,
    color: colors.text.primary,
  },
  body: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeight.body,
    color: colors.text.secondary,
  },
  bodyPrimary: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeight.body,
    color: colors.text.primary,
  },
  small: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    color: colors.text.tertiary,
  },
  caption: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    color: colors.text.tertiary,
  },
  button: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
});

export default fontStyles;
