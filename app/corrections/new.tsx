import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { TextField } from '@/src/components/ui/TextField';
import { Button } from '@/src/components/ui/Button';
import { NavyHeader } from '@/src/components/ui/Header';
import { correctionService } from '@/src/services/api';
import { toLocalDateTimeInput, todayISO, daysAgoISO } from '@/src/utils/format';
import { MapPin, AlertCircle, CheckCircle2, Navigation } from 'lucide-react-native';
import type { PunchType, GpsLocation, AttendanceCorrectionRequest } from '@/src/types';

type GpsState = 'idle' | 'capturing' | 'captured' | 'denied' | 'error';

export default function CorrectionForm() {
  const insets = useSafeAreaInsets();
  const [businessDate, setBusinessDate] = useState(daysAgoISO(0));
  const [punchType, setPunchType] = useState<PunchType>('CHECK_IN');
  const [claimedDate, setClaimedDate] = useState(daysAgoISO(0));
  const [claimedTime, setClaimedTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [gps, setGps] = useState<GpsState>('idle');
  const [location, setLocation] = useState<GpsLocation | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<AttendanceCorrectionRequest | null>(null);

  const captureGps = async () => {
    setGps('capturing');
    setError(null);
    try {
      if (Platform.OS === 'web' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              latitude: parseFloat(pos.coords.latitude.toFixed(6)),
              longitude: parseFloat(pos.coords.longitude.toFixed(6)),
              accuracyMeters: parseFloat(pos.coords.accuracy?.toFixed(1) ?? '50'),
            });
            setGps('captured');
          },
          (err) => {
            setGps(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        // Demo fallback: simulate GPS near Tirupur HQ
        await new Promise((r) => setTimeout(r, 800));
        setLocation({ latitude: 11.0169, longitude: 76.9557, accuracyMeters: 12.5 });
        setGps('captured');
      }
    } catch {
      setGps('error');
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!businessDate.trim()) { setError('Please select the business date.'); return; }
    if (!claimedTime.trim()) { setError('Please enter the claimed punch time.'); return; }
    if (reason.trim().length < 5) { setError('Reason must be at least 5 characters.'); return; }
    if (gps !== 'captured' || !location) { setError('Please capture your GPS location before submitting.'); return; }

    setSubmitting(true);
    try {
      const claimedPunchTime = toLocalDateTimeInput(claimedDate, claimedTime);
      const result = await correctionService.create({
        businessDate,
        punchType,
        claimedPunchTime,
        reason: reason.trim(),
        location,
        locationCapturedAt: new Date().toISOString(),
      });
      setSuccess(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit correction request');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <NavyHeader title="Correction Submitted" onBack={() => router.back()} />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={48} color={colors.success[500]} />
            </View>
            <Text style={styles.successTitle}>Request Submitted</Text>
            <Text style={styles.successText}>Your correction request has been submitted and is pending manager review.</Text>
          </View>
          <View style={styles.section}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={[styles.detailValue, { color: colors.warning[600] }]}>Pending</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{businessDate}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Punch Type</Text>
              <Text style={styles.detailValue}>{punchType === 'CHECK_IN' ? 'Check In' : 'Check Out'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Within Geofence</Text>
              <Text style={[styles.detailValue, { color: success.geofenceEvaluation.isWithinGeofence ? colors.success[600] : colors.error[600] }]}>
                {success.geofenceEvaluation.isWithinGeofence ? 'Yes' : 'No'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{success.geofenceEvaluation.distanceMeters.toFixed(0)} m</Text>
            </View>
          </View>
          <View style={styles.section}>
            <Button label="View Request Details" onPress={() => router.replace(`/corrections/${success.id}`)} fullWidth />
            <View style={{ height: spacing.md }} />
            <Button label="Back to Home" variant="outline" onPress={() => router.replace('/(tabs)')} fullWidth />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavyHeader title="Missed Punch Correction" onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.helperText}>Use this form only when you missed a biometric punch. Your branch manager will review the request.</Text>

          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextField label="Business Date" value={businessDate} onChangeText={setBusinessDate} placeholder="YYYY-MM-DD" helper="The date the punch was missed" />

          <Text style={styles.fieldLabel}>Punch Type</Text>
          <View style={styles.punchTypeRow}>
            <TouchableOpacity style={[styles.punchBtn, punchType === 'CHECK_IN' && styles.punchBtnActive]} onPress={() => setPunchType('CHECK_IN')}>
              <Text style={[styles.punchBtnText, punchType === 'CHECK_IN' && styles.punchBtnTextActive]}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.punchBtn, punchType === 'CHECK_OUT' && styles.punchBtnActive]} onPress={() => setPunchType('CHECK_OUT')}>
              <Text style={[styles.punchBtnText, punchType === 'CHECK_OUT' && styles.punchBtnTextActive]}>Check Out</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Claimed Punch Date</Text>
          <TextInput style={styles.textInput} value={claimedDate} onChangeText={setClaimedDate} placeholder="YYYY-MM-DD" />

          <TextField label="Claimed Punch Time" value={claimedTime} onChangeText={setClaimedTime} placeholder="HH:MM (e.g. 08:30)" />

          <TextField label="Reason" value={reason} onChangeText={setReason} placeholder="Explain why the biometric punch was missed…" multiline numberOfLines={3} style={styles.reasonInput} />

          <Text style={styles.fieldLabel}>GPS Location (Required)</Text>
          <Text style={styles.fieldHelper}>A one-time GPS snapshot is captured at submission to verify your location.</Text>
          {gps === 'idle' && (
            <TouchableOpacity style={styles.gpsBtn} onPress={captureGps}>
              <Navigation size={20} color={colors.neutral.white} />
              <Text style={styles.gpsBtnText}>Capture Location</Text>
            </TouchableOpacity>
          )}
          {gps === 'capturing' && (
            <View style={styles.gpsCapturing}>
              <Text style={styles.gpsCapturingText}>Acquiring GPS lock…</Text>
            </View>
          )}
          {gps === 'captured' && location && (
            <View style={styles.gpsCaptured}>
              <View style={styles.gpsCapturedHeader}>
                <MapPin size={18} color={colors.success[600]} />
                <Text style={styles.gpsCapturedTitle}>Location Captured</Text>
              </View>
              <Text style={styles.gpsCoords}>Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}</Text>
              <Text style={styles.gpsAccuracy}>Accuracy: ±{location.accuracyMeters.toFixed(0)} m</Text>
              <TouchableOpacity onPress={() => { setGps('idle'); setLocation(null); }}>
                <Text style={styles.gpsRetry}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          {gps === 'denied' && (
            <View style={styles.gpsError}>
              <AlertCircle size={18} color={colors.error[600]} />
              <Text style={styles.gpsErrorText}>Location permission denied. Please enable location access in your browser settings and try again.</Text>
              <Button label="Retry" variant="outline" onPress={captureGps} />
            </View>
          )}
          {gps === 'error' && (
            <View style={styles.gpsError}>
              <AlertCircle size={18} color={colors.error[600]} />
              <Text style={styles.gpsErrorText}>Could not acquire GPS. Please ensure location services are enabled.</Text>
              <Button label="Retry" variant="outline" onPress={captureGps} />
            </View>
          )}

          <View style={{ height: spacing.lg }} />
          <Button label="Submit Correction Request" onPress={handleSubmit} loading={submitting} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  section: { padding: spacing.lg },
  helperText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary, lineHeight: 20, marginBottom: spacing.lg, backgroundColor: colors.blue[50], padding: spacing.md, borderRadius: radii.md },
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.error[50], borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.error[500] },
  errorText: { flex: 1, fontSize: typography.sizes.sm, color: colors.error[600], lineHeight: 20 },
  fieldLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.xs, marginTop: spacing.md },
  fieldHelper: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginBottom: spacing.sm },
  punchTypeRow: { flexDirection: 'row', gap: spacing.sm },
  punchBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.neutral[200], alignItems: 'center' },
  punchBtnActive: { borderColor: colors.blue[500], backgroundColor: colors.blue[50] },
  punchBtnText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.tertiary },
  punchBtnTextActive: { color: colors.blue[500] },
  textInput: { backgroundColor: colors.neutral[50], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.sizes.md, color: colors.text.primary, minHeight: 50 },

  reasonInput: { minHeight: 80, textAlignVertical: 'top' },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.blue[500], borderRadius: radii.md, paddingVertical: spacing.md },
  gpsBtnText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.neutral.white },
  gpsCapturing: { paddingVertical: spacing.md, alignItems: 'center' },
  gpsCapturingText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.tertiary },
  gpsCaptured: { backgroundColor: colors.success[50], borderRadius: radii.md, padding: spacing.md, borderLeftWidth: 4, borderLeftColor: colors.success[500] },
  gpsCapturedHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  gpsCapturedTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.success[600] },
  gpsCoords: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: spacing.xs },
  gpsAccuracy: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: 2 },
  gpsRetry: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.blue[500], marginTop: spacing.sm },
  gpsError: { backgroundColor: colors.error[50], borderRadius: radii.md, padding: spacing.md, gap: spacing.sm },
  gpsErrorText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.error[600], lineHeight: 20, marginBottom: spacing.sm },
  successSection: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxl, color: colors.text.primary, marginTop: spacing.lg },
  successText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.neutral[100] },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.tertiary },
  detailValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
});
