import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { branchService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { ListItem } from '@/src/components/ui/ListItem';
import { Badge } from '@/src/components/ui/Badge';
import { Header } from '@/src/components/ui/Header';
import { Building2, MapPin, User } from 'lucide-react-native';
import type { Branch } from '@/src/types';

export default function BranchesTab() {
  const insets = useSafeAreaInsets();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await branchService.list();
      setBranches(res.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load branches');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <View style={styles.container}>
      <Header title="Branches" subtitle="Business directory" />
      {loading ? (
        <LoadingState label="Loading branches…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : branches.length === 0 ? (
        <EmptyState title="No branches found" />
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: insets.bottom + 80 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}>
          <Card style={styles.listCard}>
            {branches.map((b, i) => (
              <ListItem
                key={b.id}
                title={b.name}
                subtitle={`${b.code} · ${b.address ?? 'No address'}`}
                badge={b.isActive ? <Badge label="Active" variant="success" /> : <Badge label="Inactive" variant="neutral" />}
                onPress={() => router.push(`/branches/${b.id}`)}
                style={i === branches.length - 1 ? { borderBottomWidth: 0 } : undefined}
              />
            ))}
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  listCard: { padding: 0, overflow: 'hidden' },
});
