import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TextInput, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { reportService, branchService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState, StatCard } from '@/src/components/ui/Screen';
import { Header } from '@/src/components/ui/Header';
import { Button } from '@/src/components/ui/Button';
import { daysAgoISO, todayISO, formatDate } from '@/src/utils/format';
import { BarChart3 } from 'lucide-react-native';
import type { AttendanceReport, Branch } from '@/src/types';

export default function ReportsTab() {
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fromDate, setFromDate] = useState(daysAgoISO(6));
  const [toDate, setToDate] = useState(todayISO());
  const [branchId, setBranchId] = useState('');
  const [groupBy, setGroupBy] = useState<'DAY' | 'BRANCH' | 'EMPLOYEE'>('DAY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [rep, brs] = await Promise.all([
        reportService.attendance({ fromDate, toDate, groupBy, branchId: branchId || undefined }),
        branchService.list(),
      ]);
      setReport(rep);
      setBranches(brs.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fromDate, toDate, groupBy, branchId]);

  useEffect(() => { loadData(); }, [loadData]);

  const runReport = () => {
    setLoading(true);
    loadData();
  };

  const maxPresent = report ? Math.max(...report.rows.map((r) => r.presentCount), 1) : 1;

  return (
    <View style={styles.container}>
      <Header title="Reports" subtitle="Attendance analytics" />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
        <Card style={styles.filterCard}>
          <Text style={styles.filterTitle}>Date Range</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <TextInput style={styles.dateInput} value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <TextInput style={styles.dateInput} value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" />
            </View>
          </View>
          <Text style={styles.filterLabel}>Group By</Text>
          <View style={styles.groupRow}>
            {(['DAY', 'BRANCH', 'EMPLOYEE'] as const).map((g) => (
              <TouchableOpacity key={g} style={[styles.groupBtn, groupBy === g && styles.groupBtnActive]} onPress={() => setGroupBy(g)}>
                <Text style={[styles.groupText, groupBy === g && styles.groupTextActive]}>{g === 'DAY' ? 'Day' : g === 'BRANCH' ? 'Branch' : 'Employee'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {branches.length > 0 && (
            <>
              <Text style={styles.filterLabel}>Branch Filter</Text>
              <TouchableOpacity style={styles.branchSelect} onPress={() => setBranchId(branchId ? '' : branches[0]?.id ?? '')}>
                <Text style={styles.branchSelectText}>{branchId ? branches.find((b) => b.id === branchId)?.name ?? 'All Branches' : 'All Branches'}</Text>
              </TouchableOpacity>
              {branches.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.branchChips}>
                  <TouchableOpacity style={[styles.chip, !branchId && styles.chipActive]} onPress={() => setBranchId('')}>
                    <Text style={[styles.chipText, !branchId && styles.chipTextActive]}>All</Text>
                  </TouchableOpacity>
                  {branches.map((b) => (
                    <TouchableOpacity key={b.id} style={[styles.chip, branchId === b.id && styles.chipActive]} onPress={() => setBranchId(b.id)}>
                      <Text style={[styles.chipText, branchId === b.id && styles.chipTextActive]}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}
          <Button label="Run Report" onPress={runReport} loading={loading} fullWidth />
        </Card>

        {loading ? (
          <LoadingState label="Generating report…" />
        ) : error ? (
          <ErrorState message={error} onRetry={loadData} />
        ) : report ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Totals</Text>
              <View style={styles.statsRow}>
                <StatCard label="Employees" value={report.totals.totalEmployees} />
                <StatCard label="Present" value={report.totals.presentCount} accent={colors.success[600]} />
              </View>
              <View style={styles.statsRow}>
                <StatCard label="Absent" value={report.totals.absentCount} accent={colors.error[600]} />
                <StatCard label="Late" value={report.totals.lateCount} accent={colors.warning[600]} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Breakdown</Text>
              {report.rows.length === 0 ? (
                <EmptyState title="No data for selected range" />
              ) : (
                <View style={styles.chartArea}>
                  {report.rows.map((row) => (
                    <View key={row.key} style={styles.chartRow}>
                      <Text style={styles.chartLabel} numberOfLines={1}>{row.label}</Text>
                      <View style={styles.chartBarBg}>
                        <View style={[styles.chartBarFill, { width: `${(row.presentCount / maxPresent) * 100}%` }]} />
                      </View>
                      <Text style={styles.chartValue}>{row.presentCount}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  filterCard: { margin: spacing.lg, gap: spacing.sm },
  filterTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  dateRow: { flexDirection: 'row', gap: spacing.md },
  dateField: { flex: 1 },
  dateLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginBottom: 4 },
  dateInput: { backgroundColor: colors.neutral[50], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, fontSize: typography.sizes.md, color: colors.text.primary, minHeight: 44 },
  filterLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: spacing.sm, marginBottom: 4 },
  groupRow: { flexDirection: 'row', gap: spacing.sm },
  groupBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.neutral[200], alignItems: 'center' },
  groupBtnActive: { borderColor: colors.blue[500], backgroundColor: colors.blue[50] },
  groupText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  groupTextActive: { color: colors.blue[500] },
  branchSelect: { backgroundColor: colors.neutral[50], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  branchSelectText: { fontSize: typography.sizes.md, color: colors.text.primary },
  branchChips: { flexDirection: 'row', maxHeight: 40 },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radii.pill, backgroundColor: colors.neutral[100], marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.blue[500] },
  chipText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  chipTextActive: { color: colors.neutral.white },
  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.lg, color: colors.text.primary, marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  chartArea: { gap: spacing.sm },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chartLabel: { width: 60, fontSize: typography.sizes.sm, color: colors.text.secondary, fontFamily: typography.fontFamilyBold },
  chartBarBg: { flex: 1, height: 24, backgroundColor: colors.neutral[100], borderRadius: radii.sm, overflow: 'hidden' },
  chartBarFill: { height: '100%', backgroundColor: colors.blue[500], borderRadius: radii.sm },
  chartValue: { width: 36, textAlign: 'right', fontSize: typography.sizes.sm, color: colors.text.primary, fontFamily: typography.fontFamilyBold },
});
