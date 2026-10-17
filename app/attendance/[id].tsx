import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { attendanceService } from '@/src/services/api';
import { Card, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { NavyHeader } from '@/src/components/ui/Header';
import { formatDate, formatTime, formatMinutes, formatDateTime } from '@/src/utils/format';
import { LogIn, LogOut, Clock, TrendingUp, ShieldCheck } from 'lucide-react-native';
import type { AttendanceRecord } from '@/src/types';

export default function AttendanceRecordDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fromDate = '2026-09-01';
        const toDate = '2026-10-31';
        const res = await attendanceService.myRecords(fromDate, toDate);
        const found = res.items.find((r) => r.id === id);
        if (!found) throw new Error('Record not found');
        setRecord(found);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load record');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={styles.container}><NavyHeader title="Attendance Detail" onBack={() => router.back()} /><LoadingState label="Loading record…" /></View>;
  if (error || !record) return <View style={styles.container}><NavyHeader title="Attendance Detail" onBack={() => router.back()} /><ErrorState message={error ?? 'Record not found'} onRetry={() => router.back()} /></View>;

  return (
    <View style={styles.container}>
      <NavyHeader title="Attendance Detail" subtitle={formatDate(record.businessDate)} onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.statusBanner}>
          <Badge label={formatStatusLabel(record.status)} variant={statusBadgeVariant(record.status)} />
          {record.isCorrected && <Badge label="Corrected" variant="info" />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Punch Times</Text>
          <Card>
            <DetailRow icon={<LogIn size={20} color={colors.success[600]} />} label="Check In" value={record.checkInTime ? formatTime(record.checkInTime) : '—'} sub={record.checkInSource ? formatStatusLabel(record.checkInSource) : undefined} />
            <DetailRow icon={<LogOut size={20} color={colors.error[600]} />} label="Check Out" value={record.checkOutTime ? formatTime(record.checkOutTime) : '—'} sub={record.checkOutSource ? formatStatusLabel(record.checkOutSource) : undefined} />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worked Hours</Text>
          <View style={styles.statsRow}>
            <MiniStat icon={<Clock size={18} color={colors.blue[600]} />} label="Worked" value={formatMinutes(record.workedMinutes)} />
            <MiniStat icon={<TrendingUp size={18} color={colors.success[600]} />} label="Overtime" value={formatMinutes(record.overtimeMinutes)} />
          </View>
        </View>

        {record.correctionAudit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Correction Audit</Text>
            <Card>
              <View style={styles.auditRow}>
                <ShieldCheck size={20} color={colors.success[600]} />
                <View style={styles.auditContent}>
                  <Text style={styles.auditLabel}>Approved by Manager</Text>
                  <Text style={styles.auditValue}>{formatDateTime(record.correctionAudit.approvedAt)}</Text>
                  {record.correctionAudit.comment && <Text style={styles.auditComment}>{record.correctionAudit.comment}</Text>}
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
      {sub && <Badge label={sub} variant="neutral" />}
    </View>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      {icon}
      <Text style={styles.miniStatLabel}>{label}</Text>
      <Text style={styles.miniStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  statusBanner: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.lg, color: colors.text.primary, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.neutral[100] },
  detailIcon: { marginRight: spacing.md },
  detailContent: { flex: 1 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  miniStat: { flex: 1, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.lg, alignItems: 'center' },
  miniStatLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.3 },
  miniStatValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xl, color: colors.text.primary, marginTop: 4 },
  auditRow: { flexDirection: 'row', padding: spacing.lg },
  auditContent: { flex: 1, marginLeft: spacing.md },
  auditLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  auditValue: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary, marginTop: 4 },
  auditComment: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.sm, lineHeight: 20 },
});
