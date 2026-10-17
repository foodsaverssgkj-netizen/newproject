import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, radii, typography } from '@/src/theme/tokens';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  helper?: string;
}

export function TextField({ label, error, helper, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 50,
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});
