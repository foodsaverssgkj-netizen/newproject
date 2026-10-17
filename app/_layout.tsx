import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/src/hooks/useAuth';
import { colors, typography, spacing } from '@/src/theme/tokens';
import { ShieldCheck } from 'lucide-react-native';

function SplashGate() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoCircle}>
          <ShieldCheck size={40} color={colors.neutral.white} />
        </View>
        <Text style={styles.appName}>Inaivo HRMS</Text>
        <ActivityIndicator size="small" color={colors.neutral[300]} style={{ marginTop: spacing.xl }} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <SplashGate />
      <StatusBar style="light" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.navy[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.blue[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxxl,
    color: colors.text.inverse,
    marginTop: spacing.lg,
  },
});
