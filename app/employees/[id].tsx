import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { employeeService } from '@/src/services/api';
import { Card, LoadingState, ErrorState } from '@/src/components/ui/Screen';
import { Badge, statusBadgeVariant, formatStatusLabel } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { NavyHeader } from '@/src/components/ui/Header';
import { useAuth } from '@/src/hooks/useAuth';
import { formatDate } from '@/src/utils/format';
import { User, Mail, Phone, Building2, Calendar, Briefcase, Shield, Edit2 } from 'lucide-react-native';
import type { Employee } from '@/src/types';

export default function EmployeeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await employeeService.get(id);
        setEmployee(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load employee');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const isAdmin = user?.user.role === 'admin';
  const isSelf = user?.user.employeeId === id;

  if (loading) return <View style={styles.container}><NavyHeader title="Employee" onBack={() => router.back()} /><LoadingState /></View>;
  if (error || !employee) return <View style={styles.container}><NavyHeader title="Employee" onBack={() => router.back()} /><ErrorState message={error ?? 'Not found'} onRetry={() => router.back()} /></View>;

  return (
    <View style={styles.container}>
      <NavyHeader
        title={`${employee.firstName} ${employee.lastName}`}
        subtitle={employee.employeeCode}
        onBack={() => router.back()}
        right={isAdmin ? (
          <TouchableOpacity onPress={() => router.push(`/employees/${employee.id}/edit`)}>
            <View style={styles.editBtn}><Edit2 size={18} color={colors.neutral.white} /></View>
          </TouchableOpacity>
        ) : undefined}
      />
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        <View style={styles.statusBanner}>
          <Badge label={formatStatusLabel(employee.status)} variant={statusBadgeVariant(employee.status)} />
          <Badge label={formatStatusLabel(employee.employmentType)} variant="neutral" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Card>
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Full Name" value={`${employee.firstName} ${employee.lastName}`} />
            <DetailRow icon={<Briefcase size={18} color={colors.text.tertiary} />} label="Designation" value={employee.designation ?? '—'} />
            <DetailRow icon={<Calendar size={18} color={colors.text.tertiary} />} label="Joining Date" value={formatDate(employee.joiningDate)} />
            <DetailRow icon={<Mail size={18} color={colors.text.tertiary} />} label="Work Email" value={employee.workEmail ?? '—'} />
            <DetailRow icon={<Phone size={18} color={colors.text.tertiary} />} label="Phone" value={employee.phoneNumber ?? '—'} />
            <DetailRow icon={<Building2 size={18} color={colors.text.tertiary} />} label="Branch" value={employee.branch.name} />
            <DetailRow icon={<Shield size={18} color={colors.text.tertiary} />} label="Gender" value={employee.gender ? formatStatusLabel(employee.gender) : '—'} last />
          </Card>
        </View>

        {(isAdmin || isSelf) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employment Type</Text>
            <Card>
              <DetailRow icon={<Briefcase size={18} color={colors.text.tertiary} />} label="Type" value={formatStatusLabel(employee.employmentType)} />
              <DetailRow icon={<Shield size={18} color={colors.text.tertiary} />} label="Status" value={formatStatusLabel(employee.status)} last />
            </Card>
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
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blue[500], alignItems: 'center', justifyContent: 'center' },
});
