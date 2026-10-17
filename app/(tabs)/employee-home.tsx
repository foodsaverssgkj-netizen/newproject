import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { useAuth } from '@/src/hooks/useAuth';
import { attendanceService, notificationService } from '@/src/services/api';
import { Card, StatCard, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { formatDate, formatTime, formatMinutes, daysAgoISO, todayISO, formatRelativeTime } from '@/src/utils/format';
import { CalendarClock, FileText, Clock, TrendingUp, ChevronRight, MapPin } from 'lucide-react-native';
import type { AttendanceRecord, AttendanceSummary, Notification } from '@/src/types';

export default function EmployeeHome() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const fromDate = daysAgoISO(29);
      const toDate = todayISO();
      const [recs, summ, notifs] = await Promise.all([
        attendanceService.myRecords(fromDate, toDate),
        attendanceService.mySummary(fromDate, toDate),
        notificationService.list({ limit: 3 }),
      ]);
      setRecords(recs.items.slice(0, 5));
      setSummary(summ);
      setNotifications(notifs.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading your dashboard…" />;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.user.displayName}</Text>
          {user?.branch && <Text style={styles.branchName}>{user.branch.name}</Text>}
        </View>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <ErrorState message={error} onRetry={loadData} />
        </View>
      )}

      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month Overview</Text>
          <View style={styles.statsRow}>
            <StatCard label="Present" value={summary.presentDays} accent={colors.success[600]} />
            <StatCard label="Late" value={summary.lateCount} accent={colors.warning[600]} />
          </View>
          <View style={styles.statsRow}>
            <StatCard label="Absent" value={summary.absentDays} accent={colors.error[600]} />
            <StatCard label="Overtime" value={formatMinutes(summary.overtimeMinutes)} accent={colors.blue[600]} />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/attendance')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.blue[50] }]}>
              <CalendarClock size={24} color={colors.blue[600]} />
            </View>
            <Text style={styles.actionLabel}>Attendance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/leave')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.success[50] }]}>
              <FileText size={24} color={colors.success[600]} />
            </View>
            <Text style={styles.actionLabel}>Leave</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/corrections/new')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.warning[50] }]}>
              <Clock size={24} color={colors.warning[600]} />
            </View>
            <Text style={styles.actionLabel}>Correction</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/notifications')}>
            <View style={[styles.actionIcon, { backgroundColor: colors.neutral[100] }]}>
              <TrendingUp size={24} color={colors.text.secondary} />
            </View>
            <Text style={styles.actionLabel}>Summary</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/attendance')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <Card style={styles.listCard}>
          {records.length === 0 && <Text style={styles.emptyText}>No recent records</Text>}
          {records.map((r) => (
            <ListItem
              key={r.id}
              title={formatDate(r.businessDate)}
              subtitle={r.checkInTime ? `In ${formatTime(r.checkInTime)} · Out ${r.checkOutTime ? formatTime(r.checkOutTime) : '—'} · ${formatMinutes(r.workedMinutes)}` : 'No punch data'}
              badge={<Badge label={formatStatusLabel(r.status)} variant={statusBadgeVariant(r.status)} />}
              onPress={() => router.push(`/attendance/${r.id}`)}
            />
          ))}
        </Card>
      </View>

      {notifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <Card style={styles.listCard}>
            {notifications.map((n) => (
              <ListItem
                key={n.id}
                title={n.title}
                subtitle={n.body}
                rightLabel={formatRelativeTime(n.createdAt)}
                onPress={() => router.push('/(tabs)/notifications')}
              />
            ))}
          </Card>
        </View>
      )}

      <View style={{ height: insets.bottom + 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.navy[900],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.neutral[300],
  },
  userName: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.xxxl,
    color: colors.text.inverse,
    marginTop: 2,
  },
  branchName: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.blue[300],
    marginTop: spacing.xs,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.sm,
    color: colors.blue[500],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  emptyText: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  errorBox: {
    margin: spacing.lg,
  },
});
