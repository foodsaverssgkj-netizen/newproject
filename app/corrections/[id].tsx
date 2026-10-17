import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { correctionService } from '@/src/services/api';
import { Card, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { NavyHeader } from '@/src/components/ui/Header';
import { formatDate, formatDateTime } from '@/src/utils/format';
import { MapPin, Clock, FileText, ShieldCheck, ShieldX, Navigation, User } from 'lucide-react-native';
import type { AttendanceCorrectionRequest } from '@/src/types';

export default function CorrectionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [correction, setCorrection] = useState<AttendanceCorrectionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await correctionService.get(id);
        setCorrection(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load request');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <View style={styles.container}><NavyHeader title="Correction Request" onBack={() => router.back()} /><LoadingState /></View>;
  if (error || !correction) return <View style={styles.container}><NavyHeader title="Correction Request" onBack={() => router.back()} /><ErrorState message={error ?? 'Not found'} onRetry={() => router.back()} /></View>;

  return (
    <View style={styles.container}>
      <NavyHeader title="Correction Request" subtitle={correction.employeeName} onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.statusBanner}>
          <Badge label={formatStatusLabel(correction.status)} variant={statusBadgeVariant(correction.status)} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request Details</Text>
          <Card>
            <DetailRow icon={<FileText size={18} color={colors.text.tertiary} />} label="Business Date" value={formatDate(correction.businessDate)} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Punch Type" value={correction.punchType === 'CHECK_IN' ? 'Check In' : 'Check Out'} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Claimed Time" value={formatDateTime(correction.claimedPunchTime)} />
            <DetailRow icon={<FileText size={18} color={colors.text.tertiary} />} label="Reason" value={correction.reason} last />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GPS & Geofence</Text>
          <Card>
            <DetailRow icon={<MapPin size={18} color={colors.text.tertiary} />} label="Coordinates" value={`${correction.submissionLocation.latitude.toFixed(4)}, ${correction.submissionLocation.longitude.toFixed(4)}`} />
            <DetailRow icon={<Navigation size={18} color={colors.text.tertiary} />} label="Accuracy" value={`±${correction.submissionLocation.accuracyMeters.toFixed(0)} m`} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Captured At" value={formatDateTime(correction.locationCapturedAt)} />
            <DetailRow icon={<MapPin size={18} color={correction.geofenceEvaluation.isWithinGeofence ? colors.success[600] : colors.error[600]} />} label="Within Geofence" value={correction.geofenceEvaluation.isWithinGeofence ? 'Yes' : 'No'} last />
            <View style={styles.geofenceDetail}>
              <Text style={styles.geofenceText}>Distance from branch: {correction.geofenceEvaluation.distanceMeters.toFixed(0)} m</Text>
              <Text style={styles.geofenceText}>Allowed radius: {correction.geofenceEvaluation.allowedRadiusMeters.toFixed(0)} m</Text>
            </View>
          </Card>
        </View>

        {correction.review && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manager Decision</Text>
            <Card>
              <View style={styles.reviewRow}>
                {correction.review.decision === 'APPROVE' ? <ShieldCheck size={20} color={colors.success[600]} /> : <ShieldX size={20} color={colors.error[600]} />}
                <View style={styles.reviewContent}>
                  <Text style={styles.reviewLabel}>{correction.review.decision === 'APPROVE' ? 'Approved' : 'Rejected'} by {correction.review.reviewedByDisplayName}</Text>
                  <Text style={styles.reviewDate}>{formatDateTime(correction.review.reviewedAt)}</Text>
                  {correction.review.comment && <Text style={styles.reviewComment}>Comment: {correction.review.comment}</Text>}
                  {correction.review.rejectionReason && <Text style={styles.reviewReason}>Reason: {correction.review.rejectionReason}</Text>}
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee</Text>
          <Card>
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Code" value={correction.employeeCode} />
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Name" value={correction.employeeName} last />
          </Card>
        </View>

        {correction.status === 'PENDING' && (
          <View style={styles.section}>
            <View style={styles.pendingInfo}>
              <Clock size={20} color={colors.warning[600]} />
              <Text style={styles.pendingText}>This request is awaiting manager review. You'll be notified when a decision is made.</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  geofenceDetail: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.neutral[50], borderBottomLeftRadius: radii.lg, borderBottomRightRadius: radii.lg },
  geofenceText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, lineHeight: 20 },
  reviewRow: { flexDirection: 'row', padding: spacing.lg },
  reviewContent: { flex: 1, marginLeft: spacing.md },
  reviewLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  reviewDate: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary, marginTop: 4 },
  reviewComment: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.sm, lineHeight: 20 },
  reviewReason: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.error[600], marginTop: spacing.sm, lineHeight: 20 },
  pendingInfo: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.warning[50], borderRadius: radii.md, padding: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.warning[500] },
  pendingText: { flex: 1, fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.warning[600], lineHeight: 20 },
});
