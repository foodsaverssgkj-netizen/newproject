import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, subtitle, accent, icon }: StatCardProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconWrap}>{icon}</View>}
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, accent && { color: accent }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    minHeight: 96,
    justifyContent: 'center',
  },
  iconWrap: {
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxl,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
