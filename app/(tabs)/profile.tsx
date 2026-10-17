import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { useAuth } from '@/src/hooks/useAuth';
import { Card } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge, formatStatusLabel } from '@/src/components/ui/Badge';
import { ConfirmDialog } from '@/src/components/ui/Modal';
import { formatDate } from '@/src/utils/format';
import { User, Settings, LogOut, Shield, Mail, Phone, Building2, ChevronRight, Clock, Info } from 'lucide-react-native';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [showLogout, setShowLogout] = useState(false);

  if (!user) return null;
  const emp = user.employee;
  const initials = user.user.displayName
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}>
      <View style={styles.headerSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.displayName}>{user.user.displayName}</Text>
        <Text style={styles.username}>@{user.user.username}</Text>
        <View style={styles.roleBadge}>
          <Badge label={formatStatusLabel(user.user.role)} variant="blue" />
        </View>
      </View>

      {emp && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employment Details</Text>
          <Card style={styles.detailCard}>
            <DetailRow icon={<User size={18} color={colors.text.tertiary} />} label="Employee Code" value={emp.employeeCode} />
            <DetailRow icon={<Building2 size={18} color={colors.text.tertiary} />} label="Branch" value={emp.branch.name} />
            <DetailRow icon={<Shield size={18} color={colors.text.tertiary} />} label="Designation" value={emp.designation ?? '—'} />
            <DetailRow icon={<Clock size={18} color={colors.text.tertiary} />} label="Joined" value={formatDate(emp.joiningDate)} />
            <DetailRow icon={<Mail size={18} color={colors.text.tertiary} />} label="Work Email" value={emp.workEmail ?? '—'} last />
          </Card>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business</Text>
        <Card style={styles.detailCard}>
          <DetailRow icon={<Building2 size={18} color={colors.text.tertiary} />} label="Company" value={user.business.name} />
          <DetailRow icon={<Info size={18} color={colors.text.tertiary} />} label="Code" value={user.business.code} last />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card style={styles.detailCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => {}}>
            <View style={styles.menuLeft}>
              <Settings size={20} color={colors.text.secondary} />
              <Text style={styles.menuLabel}>App Settings</Text>
            </View>
            <ChevronRight size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setShowLogout(true)}>
          <LogOut size={20} color={colors.error[500]} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showLogout}
        title="Sign Out"
        message="Are you sure you want to sign out? You'll need to log in again to access Inaivo HRMS."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        danger
        onConfirm={async () => {
          setShowLogout(false);
          await signOut();
          router.replace('/login');
        }}
        onCancel={() => setShowLogout(false)}
      />
    </ScrollView>
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
  headerSection: { backgroundColor: colors.navy[900], alignItems: 'center', paddingVertical: spacing.xxl + 12, paddingHorizontal: spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.blue[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxl, color: colors.neutral.white },
  displayName: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xxl, color: colors.text.inverse, marginTop: spacing.md },
  username: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.neutral[300], marginTop: 2 },
  roleBadge: { marginTop: spacing.sm },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.lg, color: colors.text.primary, marginBottom: spacing.md },
  detailCard: { padding: 0, overflow: 'hidden' },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.neutral[100] },
  detailIcon: { marginRight: spacing.md },
  detailContent: { flex: 1 },
  detailLabel: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, textTransform: 'uppercase', letterSpacing: 0.3 },
  detailValue: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary, marginTop: 2 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuLabel: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radii.md, paddingVertical: spacing.lg, ...shadows.card },
  logoutText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.error[500] },
});
