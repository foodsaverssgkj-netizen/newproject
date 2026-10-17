import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { TextField } from '@/src/components/ui/TextField';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/hooks/useAuth';
import { ShieldCheck, Eye, EyeOff, Info } from 'lucide-react-native';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [tenantCode, setTenantCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!tenantCode.trim() || !identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const deviceInfo = Platform.OS === 'web' ? 'Web Browser' : `${Platform.OS} ${Platform.Version}`;
      await signIn(tenantCode.trim(), identifier.trim(), password, deviceInfo);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'web' ? undefined : 'padding'}>
      <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.headerSection}>
          <View style={styles.logoCircle}>
            <ShieldCheck size={36} color={colors.neutral.white} />
          </View>
          <Text style={styles.appName}>Inaivo HRMS</Text>
          <Text style={styles.tagline}>Workforce management for garment & textile enterprises</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextField
            label="Company Code"
            value={tenantCode}
            onChangeText={setTenantCode}
            placeholder="e.g. tirupur-textiles"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextField
            label="Employee ID / Username"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. EMP-1048"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.passwordWrap}>
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.eyeBtn} onPress={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={20} color={colors.text.tertiary} /> : <Eye size={20} color={colors.text.tertiary} />}
            </Text>
          </View>

          <Button label="Sign In" onPress={handleLogin} loading={loading} fullWidth />

          <Text style={styles.forgotLink} onPress={() => setShowHelp(true)}>
            Forgot password?
          </Text>
        </View>

        <View style={styles.demoHint}>
          <Info size={14} color={colors.text.tertiary} />
          <Text style={styles.demoText}>
            Demo mode — use identifier containing "admin", "mgr", or any other value for employee role.
          </Text>
        </View>

        {showHelp && (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>Password Reset Unavailable</Text>
            <Text style={styles.helpText}>
              Self-service password reset is not available in the current system. Please contact your branch manager or IT support desk to reset your credentials.
            </Text>
            <Button label="Got it" onPress={() => setShowHelp(false)} variant="outline" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.navy[900],
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing.xxxl + 16,
    paddingBottom: spacing.xxxl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.header,
  },
  appName: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxxl,
    color: colors.text.inverse,
    marginTop: spacing.lg,
  },
  tagline: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.neutral[300],
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxxl,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    ...shadows.header,
  },
  formTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  errorBanner: {
    backgroundColor: colors.error[50],
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error[500],
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: colors.error[600],
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: spacing.md,
    bottom: 28,
    padding: spacing.xs,
  },
  forgotLink: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.sm,
    color: colors.blue[500],
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  demoHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  demoText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xs,
    color: colors.neutral[300],
    flex: 1,
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadows.card,
  },
  helpTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
});
