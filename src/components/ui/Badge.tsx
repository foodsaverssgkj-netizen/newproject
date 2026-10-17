import { Text, StyleSheet } from 'react-native';
import { colors, typography, radii, spacing } from '@/src/theme/tokens';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'blue';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: colors.success[50], text: colors.success[600] },
  warning: { bg: colors.warning[50], text: colors.warning[600] },
  error: { bg: colors.error[50], text: colors.error[600] },
  info: { bg: colors.blue[50], text: colors.blue[600] },
  neutral: { bg: colors.neutral[100], text: colors.text.secondary },
  blue: { bg: colors.blue[500], text: colors.neutral.white },
};

export function Badge({ label, variant = 'neutral' }: { label: string; variant?: BadgeVariant }) {
  const c = variantColors[variant];
  return <Text style={[styles.badge, { backgroundColor: c.bg, color: c.text }]}>{label}</Text>;
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'PRESENT':
    case 'APPROVED':
    case 'ACTIVE':
      return 'success';
    case 'LATE':
    case 'PENDING':
    case 'HALF_DAY':
      return 'warning';
    case 'ABSENT':
    case 'REJECTED':
    case 'TERMINATED':
    case 'SUSPENDED':
      return 'error';
    case 'CANCELLED':
    case 'WEEKLY_OFF':
    case 'HOLIDAY':
    case 'ON_LEAVE':
      return 'neutral';
    default:
      return 'info';
  }
}

export function formatStatusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
}

const styles = StyleSheet.create({
  badge: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    overflow: 'hidden',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
