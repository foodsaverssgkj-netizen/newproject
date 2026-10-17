import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radii } from '@/src/theme/tokens';
import { shadows } from '@/src/theme/tokens';
import { notificationService } from '@/src/services/api';
import { Card, LoadingState, ErrorState, EmptyState } from '@/src/components/ui/Screen';
import { Header } from '@/src/components/ui/Header';
import { formatRelativeTime } from '@/src/utils/format';
import { CheckCheck, Circle } from 'lucide-react-native';
import type { Notification } from '@/src/types';

export default function NotificationsTab() {
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await notificationService.list({ limit: 50 });
      setNotifications(res.items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const handleToggleRead = async (n: Notification) => {
    const newRead = !n.isRead;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: newRead } : x)));
    try {
      await notificationService.updateRead(n.id, newRead);
    } catch {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: n.isRead } : x)));
    }
  };

  const handlePress = (n: Notification) => {
    if (!n.isRead) handleToggleRead(n);
    if (n.deepLink) {
      const link = n.deepLink.startsWith('/') ? n.deepLink : `/${n.deepLink}`;
      if (link.includes('/corrections/')) {
        const id = link.split('/corrections/')[1];
        router.push(`/corrections/${id}`);
      } else if (link.includes('/leave/')) {
        const id = link.split('/leave/')[1];
        router.push(`/leave/${id}`);
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        right={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={handleMarkAllRead} disabled={markingAll}>
              <View style={styles.markAllBtn}>
                <CheckCheck size={16} color={colors.blue[500]} />
                <Text style={styles.markAllText}>{markingAll ? '…' : 'Mark all read'}</Text>
              </View>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {loading ? (
        <LoadingState label="Loading notifications…" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" subtitle="You'll see updates about approvals and requests here." />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} />}
        >
          <View style={styles.list}>
            {notifications.map((n, i) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notifCard, !n.isRead && styles.notifUnread, i === 0 && { borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg }]}
                onPress={() => handlePress(n)}
                activeOpacity={0.7}
              >
                <View style={styles.notifIndicator}>
                  {n.isRead ? (
                    <Circle size={10} color={colors.neutral[300]} fill={colors.neutral[200]} />
                  ) : (
                    <Circle size={10} color={colors.blue[500]} fill={colors.blue[500]} />
                  )}
                </View>
                <View style={styles.notifContent}>
                  <Text style={styles.notifTitle}>{n.title}</Text>
                  <Text style={styles.notifBody}>{n.body}</Text>
                  <Text style={styles.notifTime}>{formatRelativeTime(n.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  list: { padding: spacing.lg },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[100],
  },
  notifUnread: {
    backgroundColor: colors.blue[50],
  },
  notifIndicator: {
    paddingTop: spacing.xs,
    paddingRight: spacing.md,
  },
  notifContent: { flex: 1 },
  notifTitle: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.md, color: colors.text.primary },
  notifBody: { fontFamily: typography.fontFamily, fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 4, lineHeight: 20 },
  notifTime: { fontFamily: typography.fontFamily, fontSize: typography.sizes.xs, color: colors.text.tertiary, marginTop: 6 },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllText: { fontFamily: typography.fontFamilyBold, fontSize: typography.sizes.xs, color: colors.blue[500] },
});
