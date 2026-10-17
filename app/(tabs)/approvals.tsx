import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { correctionService, leaveService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Header } from '@/src/components/ui/Header';
import { formatDate, formatRelativeTime } from '@/src/utils/format';
import { Clock, FileText } from 'lucide-react-native';
import type { AttendanceCorrectionRequest, LeaveRequest } from '@/src/types';

type TabKey = 'corrections' | 'leave';

export default function ApprovalsTab() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('corrections');
  const [corrections, setCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'PENDING' | 'ALL'>('PENDING');

  const loadData = useCallback(async () => {
    try {
      const [corrs, levs] = await Promise.all([
        correctionService.list(filter === 'PENDING' ? { status: 'PENDING' } : {}),
        leaveService.list(filter === 'PENDING' ? { status: 'PENDING' } : {}),
      ]);
      setCorrections(corrs.items);
      setLeaves(levs.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <View style={styles.container}>
      <Header title="Approvals" subtitle="Correction & Leave requests" />
      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tab, tab === 'corrections' && styles.tabActive]} onPress={() => setTab('corrections')}>
          <Text style={[styles.tabText, tab === 'corrections' && styles.tabTextActive]}>Corrections</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'leave' && styles.tabActive]} onPress={() => setTab('leave')}>
          <Text style={[styles.tabText, tab === 'leave' && styles.tabTextActive]}>Leave</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterBtn, filter === 'PENDING' && styles.filterBtnActive]} onPress={() => setFilter('PENDING')}>
          <Text style={[styles.filterText, filter === 'PENDING' && styles.filterTextActive]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBtn, filter === 'ALL' && styles.filterBtnActive]} onPress={() => setFilter('ALL')}>
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState label="Loading approvals…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
          {tab === 'corrections' ? (
            corrections.length === 0 ? (
              <EmptyState title="No correction requests" subtitle={filter === 'PENDING' ? 'No pending corrections to review.' : 'No correction requests.'} />
            ) : (
              <Card style={styles.listCard}>
                {corrections.map((c, i) => (
                  <ListItem
                    key={c.id}
                    title={c.employeeName}
                    subtitle={`${formatDate(c.businessDate)} · ${c.punchType === 'CHECK_IN' ? 'Check In' : 'Check Out'} · ${formatRelativeTime(c.createdAt)}`}
                    badge={<Badge label={formatStatusLabel(c.status)} variant={statusBadgeVariant(c.status)} />}
                    onPress={() => router.push(`/corrections/${c.id}`)}
                    style={i === corrections.length - 1 ? { borderBottomWidth: 0 } : undefined}
                  />
                ))}
              </Card>
            )
          ) : (
            leaves.length === 0 ? (
              <EmptyState title="No leave requests" subtitle={filter === 'PENDING' ? 'No pending leave requests to review.' : 'No leave requests.'} />
            ) : (
              <Card style={styles.listCard}>
                {leaves.map((l, i) => (
                  <ListItem
                    key={l.id}
                    title={l.employeeName}
                    subtitle={`${l.leaveType.name} · ${formatDate(l.startDate)}${l.startDate !== l.endDate ? ` — ${formatDate(l.endDate)}` : ''} · ${formatRelativeTime(l.createdAt)}`}
                    badge={<Badge label={formatStatusLabel(l.status)} variant={statusBadgeVariant(l.status)} />}
                    onPress={() => router.push(`/leave/${l.id}`)}
                    style={i === leaves.length - 1 ? { borderBottomWidth: 0 } : undefined}
                  />
                ))}
              </Card>
            )
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, paddingHorizontal: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.neutral[100] },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.blue[500] },
  tabText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.tertiary },
  tabTextActive: { color: colors.blue[500] },
  filterRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  filterBtn: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, borderRadius: radii.pill, backgroundColor: colors.neutral[100] },
  filterBtnActive: { backgroundColor: colors.blue[500] },
  filterText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  filterTextActive: { color: colors.neutral.white },
  listCard: { padding: 0, overflow: 'hidden' },
});
