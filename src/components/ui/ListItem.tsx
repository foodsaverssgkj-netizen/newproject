import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { ChevronRight } from 'lucide-react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function ListItem({ title, subtitle, rightLabel, right, onPress, badge, icon, style }: ListItemProps) {
  const inner = (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>
      {badge}
      {rightLabel && <Text style={styles.rightLabel}>{rightLabel}</Text>}
      {right}
      {onPress && !right && <ChevronRight size={20} color={colors.text.tertiary} />}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {inner}
      </TouchableOpacity>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[100],
    minHeight: 64,
  },
  icon: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  rightLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
});
