import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { useAuth } from '@/src/hooks/useAuth';
import { branchService, correctionService, leaveService, notificationService, reportService } from '@/src/services/api';
import { Card, StatCard, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { formatDate, daysAgoISO, todayISO } from '@/src/utils/format';
import { Building2, Users, FileText, BarChart3, ChevronRight, AlertCircle } from 'lucide-react-native';
import type { Branch, AttendanceCorrectionRequest, LeaveRequest, AttendanceReport } from '@/src/types';

export default function AdminHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pendingCorrections, setPendingCorrections] = useState<AttendanceCorrectionRequest[]>([]);
  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [brs, corrs, levs, rep] = await Promise.all([
        branchService.list(),
        correctionService.list({ status: 'PENDING' }),
        leaveService.list({ status: 'PENDING' }),
        reportService.attendance({ fromDate: daysAgoISO(6), toDate: todayISO(), groupBy: 'DAY' }),
      ]);
      setBranches(brs.items);
      setPendingCorrections(corrs.items.slice(0, 5));
      setPendingLeaves(levs.items.slice(0, 5));
      setReport(rep);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <LoadingState label="Loading dashboard…" />;

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Admin Dashboard</Text>
        <Text style={styles.userName}>{user?.user.displayName}</Text>
        <Text style={styles.branchName}>{user?.business.name}</Text>
      </View>

      {error && <View style={styles.errorBox}><ErrorState message={error} onRetry={loadData} /></View>}

      {report && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Attendance Totals</Text>
          <View style={styles.statsRow}>
            <StatCard label="Employees" value={report.totals.totalEmployees} />
            <StatCard label="Present" value={report.totals.presentCount} accent={colors.success[600]} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Absent" value={report.totals.absentCount} accent={colors.error[600]} />
            <StatCard label="Late" value={report.totals.lateCount} accent={colors.warning[600]} />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/branches')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.blue[50] }]}><Building2 size={24} color={colors.blue[600]} /></View>
            <Text style={styles.actionLabel}>Branches</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/employees')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success[50] }]}><Users size={24} color={colors.success[600]} /></View>
            <Text style={styles.actionLabel}>Employees</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/reports')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning[50] }]}><BarChart3 size={24} color={colors.warning[600]} /></View>
            <Text style={styles.actionLabel}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Branches ({branches.length})</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/branches')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <Card style={styles.listCard}>
          {branches.slice(0, 3).map((b, i) => (
            <ListItem key={b.id} title={b.name} subtitle={b.code} rightLabel={b.isActive ? 'Active' : 'Inactive'} onPress={() => router.push(`/branches/${b.id}`)} style={i === Math.min(2, branches.length - 1) ? { borderBottomWidth: 0 } : undefined} />
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Corrections</Text>
        {pendingCorrections.length === 0 ? (
          <Card><Text style={styles.emptyText}>No pending corrections</Text></Card>
        ) : (
          <Card style={styles.listCard}>
            {pendingCorrections.map((c, i) => (
              <ListItem key={c.id} title={c.employeeName} subtitle={`${formatDate(c.businessDate)} · ${c.punchType === 'CHECK_IN' ? 'Check In' : 'Check Out'}`} badge={<Badge label={formatStatusLabel(c.status)} variant={statusBadgeVariant(c.status)} />} onPress={() => router.push(`/corrections/${c.id}`)} style={i === pendingCorrections.length - 1 ? { borderBottomWidth: 0 } : undefined} />
            ))}
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pending Leave Requests</Text>
        {pendingLeaves.length === 0 ? (
          <Card><Text style={styles.emptyText}>No pending leave requests</Text></Card>
        ) : (
          <Card style={styles.listCard}>
            {pendingLeaves.map((l, i) => (
              <ListItem key={l.id} title={l.employeeName} subtitle={`${l.leaveType.name} · ${formatDate(l.startDate)}`} badge={<Badge label={formatStatusLabel(l.status)} variant={statusBadgeVariant(l.status)} />} onPress={() => router.push(`/leave/${l.id}`)} style={i === pendingLeaves.length - 1 ? { borderBottomWidth: 0 } : undefined} />
            ))}
          </Card>
        )}
      </View>

      <View style={{ height: insets.bottom + 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.navy[900], paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, paddingBottom: spacing.xxl },
  greeting: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.neutral[300] },
  userName: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxxl, color: colors.text.inverse, marginTop: 2 },
  branchName: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.blue[300], marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.lg, color: colors.text.primary, marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAll: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.blue[500] },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  actionGrid: { flexDirection: 'row', gap: spacing.md },
  actionCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center', ...shadows.card },
  actionIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  actionLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.primary },
  listCard: { padding: 0, overflow: 'hidden' },
  emptyText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.tertiary, textAlign: 'center', padding: spacing.lg },
  errorBox: { margin: spacing.lg },
});
