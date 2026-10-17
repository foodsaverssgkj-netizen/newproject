import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { TextField } from '@/src/components/ui/TextField';
import { Button } from '@/src/components/ui/Button';
import { NavyHeader } from '@/src/components/ui/Header';
import { leaveService } from '@/src/services/api';
import { formatDate, todayISO } from '@/src/utils/format';
import { CheckCircle2, AlertCircle } from 'lucide-react-native';
import type { LeaveType, DayPart, LeaveRequest } from '@/src/types';

export default function NewLeaveRequest() {
  const insets = useSafeAreaInsets();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(todayISO());
  const [dayPart, setDayPart] = useState<DayPart>('FULL_DAY');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<LeaveRequest | null>(null);

  useEffect(() => {
    leaveService.listTypes().then((res) => {
      setLeaveTypes(res.items);
      if (res.items.length > 0) setSelectedType(res.items[0].id);
    }).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load leave types'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (!selectedType) { setError('Please select a leave type.'); return; }
    if (!startDate.trim() || !endDate.trim()) { setError('Please select start and end dates.'); return; }
    if (new Date(endDate) < new Date(startDate)) { setError('End date cannot be before start date.'); return; }
    if (reason.trim().length < 3) { setError('Reason must be at least 3 characters.'); return; }
    setSubmitting(true);
    try {
      const result = await leaveService.create({
        leaveTypeId: selectedType,
        startDate,
        endDate,
        dayPart,
        reason: reason.trim(),
      });
      setSuccess(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <NavyHeader title="Leave Request" onBack={() => router.back()} />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
          <View style={styles.successSection}>
            <View style={styles.successIcon}><CheckCircle2 size={48} color={colors.success[500]} /></View>
            <Text style={styles.successTitle}>Request Submitted</Text>
            <Text style={styles.successText}>Your leave request has been submitted and is pending manager approval.</Text>
          </View>
          <View style={styles.section}>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Leave Type</Text><Text style={styles.detailValue}>{success.leaveType.name}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Dates</Text><Text style={styles.detailValue}>{formatDate(success.startDate)} — {formatDate(success.endDate)}</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Duration</Text><Text style={styles.detailValue}>{success.requestedUnits} {success.leaveType.unit.toLowerCase()}(s)</Text></View>
            <View style={styles.detailRow}><Text style={styles.detailLabel}>Status</Text><Text style={[styles.detailValue, { color: colors.warning[600] }]}>Pending</Text></View>
          </View>
          <View style={styles.section}>
            <Button label="View Request Details" onPress={() => router.replace(`/leave/${success.id}`)} fullWidth />
            <View style={{ height: spacing.md }} />
            <Button label="Back to Leave" variant="outline" onPress={() => router.replace('/(tabs)/leave')} fullWidth />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavyHeader title="New Leave Request" onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.fieldLabel}>Leave Type</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading leave types…</Text>
          ) : (
            <View style={styles.typeList}>
              {leaveTypes.map((lt) => (
                <TouchableOpacity
                  key={lt.id}
                  style={[styles.typeCard, selectedType === lt.id && styles.typeCardActive]}
                  onPress={() => setSelectedType(lt.id)}
                >
                  <Text style={[styles.typeName, selectedType === lt.id && styles.typeNameActive]}>{lt.name}</Text>
                  <Text style={styles.typeCode}>{lt.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.fieldLabel}>Start Date</Text>
          <TextInput style={styles.textInput} value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.fieldLabel}>End Date</Text>
          <TextInput style={styles.textInput} value={endDate} onChangeText={setEndDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.fieldLabel}>Day Part</Text>
          <View style={styles.dayPartRow}>
            {(['FULL_DAY', 'FIRST_HALF', 'SECOND_HALF'] as DayPart[]).map((dp) => (
              <TouchableOpacity key={dp} style={[styles.dayPartBtn, dayPart === dp && styles.dayPartBtnActive]} onPress={() => setDayPart(dp)}>
                <Text style={[styles.dayPartText, dayPart === dp && styles.dayPartTextActive]}>
                  {dp === 'FULL_DAY' ? 'Full Day' : dp === 'FIRST_HALF' ? 'First Half' : 'Second Half'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextField label="Reason" value={reason} onChangeText={setReason} placeholder="Explain your leave reason…" multiline numberOfLines={3} style={styles.reasonInput} />

          <View style={{ height: spacing.lg }} />
          <Button label="Submit Leave Request" onPress={handleSubmit} loading={submitting} fullWidth />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  section: { padding: spacing.lg },
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.error[50], borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.lg, borderLeftWidth: 4, borderLeftColor: colors.error[500] },
  errorText: { flex: 1, fontSize: typography.sizes.sm, color: colors.error[600], lineHeight: 20 },
  fieldLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.secondary, marginBottom: spacing.xs, marginTop: spacing.md },
  loadingText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  typeList: { gap: spacing.sm },
  typeCard: { backgroundColor: colors.neutral[50], borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: radii.md, padding: spacing.md },
  typeCardActive: { borderColor: colors.blue[500], backgroundColor: colors.blue[50] },
  typeName: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  typeNameActive: { color: colors.blue[500] },
  typeCode: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: 2 },
  textInput: { backgroundColor: colors.neutral[50], borderWidth: 1, borderColor: colors.neutral[200], borderRadius: radii.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: typography.sizes.md, color: colors.text.primary, minHeight: 50 },

  dayPartRow: { flexDirection: 'row', gap: spacing.sm },
  dayPartBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.neutral[200], alignItems: 'center' },
  dayPartBtnActive: { borderColor: colors.blue[500], backgroundColor: colors.blue[50] },
  dayPartText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  dayPartTextActive: { color: colors.blue[500] },
  reasonInput: { minHeight: 80, textAlignVertical: 'top' },
  successSection: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxl, color: colors.text.primary, marginTop: spacing.lg },
  successText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 22 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.neutral[100] },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.tertiary },
  detailValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
});
