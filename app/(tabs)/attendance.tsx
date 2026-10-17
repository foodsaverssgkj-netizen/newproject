import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { attendanceService } from '@/src/services/api';
import { Card, StatCard, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { formatDate, formatTime, formatMinutes, daysAgoISO, todayISO } from '@/src/utils/format';
import { Header } from '@/src/components/ui/Header';
import { Calendar, Clock, AlertCircle } from 'lucide-react-native';
import type { AttendanceRecord, AttendanceSummary } from '@/src/types';

type TabKey = 'records' | 'summary';

export default function EmployeeAttendance() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('records');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const fromDate = daysAgoISO(29);
      const toDate = todayISO();
      const [recs, summ] = await Promise.all([
        attendanceService.myRecords(fromDate, toDate),
        attendanceService.mySummary(fromDate, toDate),
      ]);
      setRecords(recs.items);
      setSummary(summ);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance');
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
      <Header title="Attendance" subtitle="Last 30 days" />
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, tab === 'records' && styles.tabActive]}
          onPress={() => setTab('records')}
        >
          <Text style={[styles.tabText, tab === 'records' && styles.tabTextActive]}>Records</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'summary' && styles.tabActive]}
          onPress={() => setTab('summary')}
        >
          <Text style={[styles.tabText, tab === 'summary' && styles.tabTextActive]}>Summary</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <LoadingState label="Loading attendance…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          {tab === 'summary' && summary ? (
            <View style={styles.summaryContent}>
              <Text style={styles.rangeLabel}>{formatDate(summary.fromDate)} — {formatDate(summary.toDate)}</Text>
              <View style={styles.statsRow}>
                <StatCard label="Present Days" value={summary.presentDays} accent={colors.success[600]} icon={<Calendar size={20} color={colors.success[600]} />} />
                <StatCard label="Late Count" value={summary.lateCount} accent={colors.warning[600]} icon={<Clock size={20} color={colors.warning[600]} />} />
              </View>
              <View style={styles.statsRow}>
                <StatCard label="Absent Days" value={summary.absentDays} accent={colors.error[600]} icon={<AlertCircle size={20} color={colors.error[600]} />} />
                <StatCard label="Half Days" value={summary.halfDays} accent={colors.warning[600]} />
              </View>
              <View style={styles.statsRow}>
                <StatCard label="Overtime" value={formatMinutes(summary.overtimeMinutes)} accent={colors.blue[600]} />
              </View>
            </View>
          ) : tab === 'records' ? (
            <View style={styles.recordsContent}>
              {records.length === 0 ? (
                <EmptyState title="No attendance records" subtitle="Your attendance will appear here once available." />
              ) : (
                <Card style={styles.listCard}>
                  {records.map((r, i) => (
                    <ListItem
                      key={r.id}
                      title={formatDate(r.businessDate)}
                      subtitle={
                        r.checkInTime
                          ? `In ${formatTime(r.checkInTime)} · Out ${r.checkOutTime ? formatTime(r.checkOutTime) : '—'}`
                          : 'No punch recorded'
                      }
                      rightLabel={r.workedMinutes > 0 ? formatMinutes(r.workedMinutes) : undefined}
                      badge={
                        <View style={styles.badgeRow}>
                          {r.isCorrected && <Badge label="Corrected" variant="info" />}
                          <Badge label={formatStatusLabel(r.status)} variant={statusBadgeVariant(r.status)} />
                        </View>
                      }
                      onPress={() => router.push(`/attendance/${r.id}`)}
                      style={i === records.length - 1 ? { borderBottomWidth: 0 } : undefined}
                    />
                  ))}
                </Card>
              )}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.blue[500],
  },
  tabText: {
    fontFamily: typography.fontFamilyBold,
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.blue[500],
  },
  summaryContent: {
    padding: spacing.lg,
  },
  recordsContent: {
    padding: spacing.lg,
  },
  rangeLabel: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  listCard: {
    padding: 0,
    overflow: 'hidden',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
});
