import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';

export default function TabIndex() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  const role = user.user.role;
  if (role === 'manager') return <Redirect href="/(tabs)/manager-home" />;
  if (role === 'admin') return <Redirect href="/(tabs)/admin-home" />;
  return <Redirect href="/(tabs)/employee-home" />;
}
