import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  transparent?: boolean;
  style?: ViewStyle;
}

export function Header({ title, subtitle, onBack, right, transparent, style }: HeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, transparent && styles.transparent, { paddingTop: insets.top + 8 }, style]}>
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <ChevronLeft size={24} color={transparent ? colors.text.inverse : colors.text.primary} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, transparent && styles.titleInverse]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, transparent && styles.subtitleInverse]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
    </View>
  );
}

export function NavyHeader({ title, subtitle, onBack, right }: HeaderProps) {
  return <Header title={title} subtitle={subtitle} onBack={onBack} right={right} transparent style={styles.navy} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    ...shadows.card,
  },
  transparent: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  navy: {
    backgroundColor: colors.navy[900],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  backBtn: {
    marginRight: spacing.sm,
    marginLeft: -spacing.xs,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  titleInverse: {
    color: colors.text.inverse,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  subtitleInverse: {
    color: colors.neutral[300],
  },
  right: {
    marginLeft: spacing.sm,
  },
});
