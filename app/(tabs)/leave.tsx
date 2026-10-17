import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { leaveService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Header } from '@/src/components/ui/Header';
import { formatDate, formatRelativeTime } from '@/src/utils/format';
import { Plus, CalendarDays } from 'lucide-react-native';
import type { LeaveBalance, LeaveRequest } from '@/src/types';

type TabKey = 'balances' | 'requests';

export default function EmployeeLeave() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('balances');
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [bals, reqs] = await Promise.all([
        leaveService.myBalances(),
        leaveService.list(),
      ]);
      setBalances(bals.items);
      setRequests(reqs.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leave data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <View style={styles.container}>
      <Header title="Leave" subtitle="Balances & Requests" />
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'balances' && styles.tabActive]} onPress={() => setTab('balances')}>
          <Text style={[styles.tabText, tab === 'balances' && styles.tabTextActive]}>Balances</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'requests' && styles.tabActive]} onPress={() => setTab('requests')}>
          <Text style={[styles.tabText, tab === 'requests' && styles.tabTextActive]}>My Requests</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState label="Loading leave data…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          {tab === 'balances' ? (
            <View style={styles.balancesContent}>
              <TouchableOpacity style={styles.newRequestBtn} onPress={() => router.push('/leave/new')}>
                <Plus size={20} color={colors.neutral.white} />
                <Text style={styles.newRequestText}>New Leave Request</Text>
              </TouchableOpacity>
              {balances.length === 0 ? (
                <EmptyState title="No leave balances" subtitle="Your leave balances will appear here." />
              ) : (
                balances.map((b) => (
                  <Card key={b.leaveType.id} style={styles.balanceCard}>
                    <View style={styles.balanceHeader}>
                      <View>
                        <Text style={styles.balanceType}>{b.leaveType.name}</Text>
                        <Text style={styles.balanceCode}>{b.leaveType.code}</Text>
                      </View>
                      <Badge label={b.unit} variant="neutral" />
                    </View>
                    <View style={styles.balanceRow}>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>Allocated</Text>
                        <Text style={styles.balanceValue}>{b.allocated}</Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>Used</Text>
                        <Text style={styles.balanceValue}>{b.used}</Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>Pending</Text>
                        <Text style={styles.balanceValue}>{b.pending}</Text>
                      </View>
                      <View style={styles.balanceItem}>
                        <Text style={styles.balanceLabel}>Available</Text>
                        <Text style={[styles.balanceValue, { color: colors.success[600] }]}>{b.available}</Text>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          ) : (
            <View style={styles.requestsContent}>
              <TouchableOpacity style={styles.newRequestBtn} onPress={() => router.push('/leave/new')}>
                <Plus size={20} color={colors.neutral.white} />
                <Text style={styles.newRequestText}>New Leave Request</Text>
              </TouchableOpacity>
              {requests.length === 0 ? (
                <EmptyState title="No leave requests" subtitle="Your leave requests will appear here." />
              ) : (
                <Card style={styles.listCard}>
                  {requests.map((r, i) => (
                    <ListItem
                      key={r.id}
                      title={`${r.leaveType.name} · ${formatDate(r.startDate)}${r.startDate !== r.endDate ? ` — ${formatDate(r.endDate)}` : ''}`}
                      subtitle={`${r.requestedUnits} ${r.leaveType.unit.toLowerCase()}(s) · ${formatRelativeTime(r.createdAt)}`}
                      badge={<Badge label={formatStatusLabel(r.status)} variant={statusBadgeVariant(r.status)} />}
                      onPress={() => router.push(`/leave/${r.id}`)}
                      style={i === requests.length - 1 ? { borderBottomWidth: 0 } : undefined}
                    />
                  ))}
                </Card>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.blue[500] },
  tabText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.tertiary },
  tabTextActive: { color: colors.blue[500] },
  balancesContent: { padding: spacing.lg },
  requestsContent: { padding: spacing.lg },
  newRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.blue[500],
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
  },
  newRequestText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.neutral.white },
  balanceCard: { marginBottom: spacing.md },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  balanceType: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  balanceCode: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: 2 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  balanceItem: { alignItems: 'center' },
  balanceLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  balanceValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xl, color: colors.text.primary, marginTop: 4 },
  listCard: { padding: 0, overflow: 'hidden' },
});
