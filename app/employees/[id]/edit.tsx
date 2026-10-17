import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { employeeService, branchService } from '@/src/services/api';
import { TextField } from '@/src/components/ui/TextField';
import { Button } from '@/src/components/ui/Button';
import { NavyHeader } from '@/src/components/ui/Header';
import { useAuth } from '@/src/hooks/useAuth';
import { todayISO } from '@/src/utils/format';
import { AlertCircle, CheckCircle2 } from 'lucide-react-native';
import type { Branch, EmploymentType, EmployeeStatus, Gender } from '@/src/types';

export default function EmployeeEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [designation, setDesignation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('STAFF');
  const [status, setStatus] = useState<EmployeeStatus>('ACTIVE');
  const [branchId, setBranchId] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [emp, brs] = await Promise.all([
          employeeService.get(id),
          branchService.list(),
        ]);
        setFirstName(emp.firstName);
        setLastName(emp.lastName);
        setDesignation(emp.designation ?? '');
        setEmploymentType(emp.employmentType);
        setStatus(emp.status);
        setBranchId(emp.branch.id);
        setWorkEmail(emp.workEmail ?? '');
        setPhoneNumber(emp.phoneNumber ?? '');
        setBranches(brs.items);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (user?.user.role !== 'admin') {
    return (
      <View style={styles.container}>
        <NavyHeader title="Edit Employee" onBack={() => router.back()} />
        <View style={styles.unauthorized}>
          <AlertCircle size={48} color={colors.error[500]} />
          <Text style={styles.unauthorizedTitle}>Access Denied</Text>
          <Text style={styles.unauthorizedText}>Only administrators can edit employee profiles.</Text>
        </View>
      </View>
    );
  }

  const handleSave = async () => {
    setError(null);
    if (!firstName.trim() || !lastName.trim()) { setError('First and last name are required.'); return; }
    setSaving(true);
    try {
      await employeeService.update(id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        designation: designation.trim() || undefined,
        employmentType,
        status,
        branchId,
        workEmail: workEmail.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.replace(`/employees/${id}`), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <NavyHeader title="Employee Updated" onBack={() => router.back()} />
        <View style={styles.successSection}>
          <View style={styles.successIcon}><CheckCircle2 size={48} color={colors.success[500]} /></View>
          <Text style={styles.successTitle}>Employee Updated</Text>
          <Text style={styles.successText}>The profile has been saved successfully.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NavyHeader title="Edit Employee" onBack={() => router.back()} />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          {error && (
            <View style={styles.errorBanner}>
              <AlertCircle size={18} color={colors.error[600]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          {loading ? <Text style={styles.loadingText}>Loading…</Text> : null}

          <TextField label="First Name" value={firstName} onChangeText={setFirstName} />
          <TextField label="Last Name" value={lastName} onChangeText={setLastName} />
          <TextField label="Designation" value={designation} onChangeText={setDesignation} placeholder="e.g. Stitching Operator" />

          <Text style={styles.fieldLabel}>Employment Type</Text>
          <View style={styles.optionRow}>
            {(['STAFF', 'LABOUR', 'CONTRACTOR', 'INTERN'] as EmploymentType[]).map((t) => (
              <TouchableOpacity key={t} style={[styles.optionBtn, employmentType === t && styles.optionBtnActive]} onPress={() => setEmploymentType(t)}>
                <Text style={[styles.optionText, employmentType === t && styles.optionTextActive]}>{t.charAt(0) + t.slice(1).toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Status</Text>
          <View style={styles.optionRow}>
            {(['ACTIVE', 'SUSPENDED', 'TERMINATED'] as EmployeeStatus[]).map((s) => (
              <TouchableOpacity key={s} style={[styles.optionBtn, status === s && styles.optionBtnActive]} onPress={() => setStatus(s)}>
                <Text style={[styles.optionText, status === s && styles.optionTextActive]}>{s.charAt(0) + s.slice(1).toLowerCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Branch</Text>
          <View style={styles.optionRow}>
            {branches.map((b) => (
              <TouchableOpacity key={b.id} style={[styles.optionBtn, branchId === b.id && styles.optionBtnActive]} onPress={() => setBranchId(b.id)}>
                <Text style={[styles.optionText, branchId === b.id && styles.optionTextActive]}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextField label="Work Email" value={workEmail} onChangeText={setWorkEmail} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" />
          <TextField label="Phone" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="+91 98765 43210" keyboardType="phone-pad" />

          <View style={{ height: spacing.lg }} />
          <Button label="Save Changes" onPress={handleSave} loading={saving} fullWidth />
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
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.neutral[200] },
  optionBtnActive: { borderColor: colors.blue[500], backgroundColor: colors.blue[50] },
  optionText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  optionTextActive: { color: colors.blue[500] },
  loadingText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.tertiary },
  successSection: { alignItems: 'center', paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.success[50], alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxl, color: colors.text.primary, marginTop: spacing.lg },
  successText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
  unauthorized: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  unauthorizedTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xl, color: colors.text.primary, marginTop: spacing.lg },
  unauthorizedText: { fontFamily: typography.fontFamily, fontSize: typography.sizes.md, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.sm },
});
