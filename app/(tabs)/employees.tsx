import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { employeeService, branchService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Header } from '@/src/components/ui/Header';
import { Search, Plus, Users } from 'lucide-react-native';
import type { Employee, Branch } from '@/src/types';

export default function EmployeesTab() {
  const insets = useSafeAreaInsets();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (q?: string, branchId?: string) => {
    try {
      const [empRes, brRes] = await Promise.all([
        employeeService.list({ query: q || undefined, branchId: branchId || undefined, limit: 50 }),
        branchService.list(),
      ]);
      setEmployees(empRes.items);
      setBranches(brRes.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load employees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSearch = (text: string) => {
    setSearch(text);
    loadData(text, branchFilter);
  };

  const handleBranchFilter = (id: string) => {
    const newFilter = id === branchFilter ? '' : id;
    setBranchFilter(newFilter);
    loadData(search, newFilter);
  };

  return (
    <View style={styles.container}>
      <Header title="Employees" subtitle="Business-wide directory" right={
        <TouchableOpacity onPress={() => router.push('/employees/new')}>
          <View style={styles.addBtn}><Plus size={20} color={colors.blue[500]} /><Text style={styles.addBtnText}>Add</Text></View>
        </TouchableOpacity>
      } />
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Search size={18} color={colors.text.tertiary} />
          <TextInput style={styles.searchInput} placeholder="Search by name, code, designation…" value={search} onChangeText={handleSearch} placeholderTextColor={colors.text.tertiary} />
        </View>
      </View>
      {branches.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchFilters} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
          <TouchableOpacity style={[styles.branchChip, !branchFilter && styles.branchChipActive]} onPress={() => handleBranchFilter('')}>
            <Text style={[styles.branchChipText, !branchFilter && styles.branchChipTextActive]}>All Branches</Text>
          </TouchableOpacity>
          {branches.map((b) => (
            <TouchableOpacity key={b.id} style={[styles.branchChip, branchFilter === b.id && styles.branchChipActive]} onPress={() => handleBranchFilter(b.id)}>
              <Text style={[styles.branchChipText, branchFilter === b.id && styles.branchChipTextActive]}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {loading ? (
        <LoadingState label="Loading employees…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData()} />
      ) : employees.length === 0 ? (
        <EmptyState title="No employees found" subtitle="Try adjusting your search or filters." />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(search, branchFilter); }} />}>
          <Card style={styles.listCard}>
            {employees.map((emp, i) => (
              <ListItem
                key={emp.id}
                title={`${emp.firstName} ${emp.lastName}`}
                subtitle={`${emp.employeeCode} · ${emp.designation ?? '—'} · ${emp.branch.name}`}
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
  content: { flex: 1, padding: spacing.lg },
  searchWrap: { padding: spacing.lg, paddingBottom: spacing.sm },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.sm },
  searchInput: { flex: 1, fontSize: typography.sizes.md, color: colors.text.primary },
  branchFilters: { maxHeight: 44, paddingBottom: spacing.sm },
  branchChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.pill, backgroundColor: colors.neutral[100] },
  branchChipActive: { backgroundColor: colors.blue[500] },
  branchChipText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  branchChipTextActive: { color: colors.neutral.white },
  listCard: { padding: 0, overflow: 'hidden' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.blue[500] },
});
