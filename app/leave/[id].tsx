import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { leaveService } from '@/src/services/api';
import { Card, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { ConfirmDialog, Modal } from '@/src/components/ui/Modal';
import { TextField } from '@/src/components/ui/TextField';
import { NavyHeader } from '@/src/components/ui/Header';
import { formatDate, formatDateTime } from '@/src/utils/format';
import { Calendar, Clock, FileText, ShieldCheck, ShieldX, XCircle, User } from 'lucide-react-native';
import type { LeaveRequest } from '@/src/types';

export default function LeaveRequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const loadLeave = async () => {
    try {
      const data = await leaveService.get(id);
      setLeave(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load request');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLeave(); }, [id]);

  const handleCancel = async () => {
    if (!leave) return;
    setCancelling(true);
    try {
      const updated = await leaveService.cancel(leave.id, { reason: cancelReason.trim() || undefined });
      setLeave(updated);
      setShowCancel(false);
      setCancelReason('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cancel request');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <View style={styles.container}><NavyHeader title="Leave Request" onBack={() => router.back()} /><LoadingState /></View>;
  if (error || !leave) return <View style={styles.container}><NavyHeader title="Leave Request" onBack={() => router.back()} /><ErrorState message={error ?? 'Not found'} onRetry={() => router.back()} /></View>;

  const canCancel = leave.status === 'PENDING';

  return (
    <View style={styles.container}>
      <NavyHeader title="Leave Request" subtitle={leave.employeeName} onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.statusBanner}>
          <Badge label={formatStatusLabel(leave.status)} variant={statusBadgeVariant(leave.status)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <Card>
            <DetailRow icon={<FileText size={18} color={colors.text.tertiary} />} label="Leave Type" value={leave.leaveType.name} />
            <DetailRow icon={<Calendar size={18} color={colors.text.tertiary} />} label="Start Date" value={formatDate(leave.startDate)} />
            <DetailRow icon={<Calendar size={18} color={colors.text.tertiary} />} label="End Date" value={formatDate(leave.endDate)} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Day Part" value={leave.dayPart === 'FULL_DAY' ? 'Full Day' : leave.dayPart === 'FIRST_HALF' ? 'First Half' : 'Second Half'} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Duration" value={`${leave.requestedUnits} ${leave.leaveType.unit.toLowerCase()}(s)`} />
            <DetailRow icon={<FileText size={18} color={colors.text.tertiary} />} label="Reason" value={leave.reason} last />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee</Text>
          <Card>
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Code" value={leave.employeeCode} />
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Name" value={leave.employeeName} last />
          </Card>
        </View>

        {leave.review && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manager Decision</Text>
            <Card>
              <View style={styles.reviewRow}>
                {leave.review.decision === 'APPROVE' ? <ShieldCheck size={20} color={colors.success[600]} /> : <ShieldX size={20} color={colors.error[600]} />}
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewLabel}>{leave.review.decision === 'APPROVE' ? 'Approved' : 'Rejected'} by {leave.review.reviewedByDisplayName}</Text>
                  <Text style={styles.reviewDate}>{formatDateTime(leave.review.reviewedAt)}</Text>
                  {leave.review.comment && <Text style={styles.reviewComment}>Comment: {leave.review.comment}</Text>}
                  {leave.review.rejectionReason && <Text style={styles.reviewReason}>Reason: {leave.review.rejectionReason}</Text>}
                </View>
              </View>
            </Card>
          </View>
        )}

        {leave.cancellation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation</Text>
            <Card>
              <View style={styles.reviewRow}>
                <XCircle size={20} color={colors.text.tertiary} />
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewLabel}>Cancelled by submitter</Text>
                  <Text style={styles.reviewDate}>{formatDateTime(leave.cancellation.cancelledAt)}</Text>
                  {leave.cancellation.reason && <Text style={styles.reviewComment}>Reason: {leave.cancellation.reason}</Text>}
                </View>
              </View>
            </Card>
          </View>
        )}

        {canCancel && (
          <View style={styles.section}>
            <Button label="Cancel This Request" variant="danger" onPress={() => setShowCancel(true)} fullWidth />
          </View>
        )}
      </ScrollView>

      <Modal visible={showCancel} onClose={() => setShowCancel(false)} title="Cancel Leave Request">
        <Text style={styles.cancelText}>Are you sure you want to cancel this pending leave request? This action cannot be undone.</Text>
        <TextField label="Cancellation Reason (optional)" value={cancelReason} onChangeText={setCancelReason} placeholder="Optional reason for cancellation…" multiline numberOfLines={2} />
        <View style={styles.cancelActions}>
          <Button label="Keep Request" variant="outline" onPress={() => setShowCancel(false)} />
          <Button label="Confirm Cancel" variant="danger" onPress={handleCancel} loading={cancelling} />
        </View>
      </Modal>
    </View>
  );
}

function DetailRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.detailIcon}>{icon}</View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  statusBanner: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.lg, color: colors.text.primary, marginBottom: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.neutral[100] },
  detailIcon: { marginRight: spacing.md, paddingTop: 2 },
  detailContent: { flex: 1 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary, marginTop: 2 },
  reviewRow: { flexDirection: 'row', padding: spacing.lg },
  reviewContent: { flex: 1, marginLeft: spacing.md },
  reviewLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  reviewDate: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary, marginTop: 4 },
  reviewComment: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.sm, lineHeight: 20 },
  reviewReason: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.error[600], marginTop: spacing.sm, lineHeight: 20 },
  cancelText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.lg },
  cancelActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
});
