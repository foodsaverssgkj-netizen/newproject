import { View, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, spacing, radii, typography } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';

export { StatCard } from './StatCard';

interface ScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Screen({ children, style }: ScreenProps) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.blue[500]} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Text style={styles.retryLink} onPress={onRetry}>
          Try again
        </Text>
      )}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptyText}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
  },
  errorTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.error[500],
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  retryLink: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.blue[500],
    fontFamily: typography.fontFamilyBold,
  },
  emptyTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});
