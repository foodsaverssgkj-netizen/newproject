import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { employeeService, attendanceService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Header } from '@/src/components/ui/Header';
import { useAuth } from '@/src/hooks/useAuth';
import { Search, Users } from 'lucide-react-native';
import type { Employee } from '@/src/types';

export default function TeamTab() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (q?: string) => {
    try {
      const res = await employeeService.list({ query: q || undefined, limit: 50 });
      setEmployees(res.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load team');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (text: string) => {
    setSearch(text);
    loadData(text);
  };

  return (
    <View style={styles.container}>
      <Header title="My Team" subtitle={user?.branch?.name ?? 'Branch'} />
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.text.tertiary} />
          <TextInput style={styles.searchInput} placeholder="Search employees…" value={search} onChangeText={handleSearch} placeholderTextColor={colors.text.tertiary} />
        </View>
      </View>
      {loading ? (
        <LoadingState label="Loading team…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees found" subtitle="Try adjusting your search." />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(search); }} />}>
          <Card style={styles.listCard}>
            {employees.map((emp, i) => (
              <ListItem
                key={emp.id}
                title={`${emp.firstName} ${emp.lastName}`}
                subtitle={`${emp.employeeCode} · ${emp.designation ?? '—'}`}
                badge={<Badge label={formatStatusLabel(emp.status)} variant={statusBadgeVariant(emp.status)} />}
                onPress={() => router.push(`/employees/${emp.id}`)}
                style={i === employees.length - 1 ? { borderBottomWidth: 0 } : undefined}
              />
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  searchWrap: { padding: spacing.lg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.sizes.md, color: colors.text.primary },
  listCard: { padding: 0, overflow: 'hidden' },
});
