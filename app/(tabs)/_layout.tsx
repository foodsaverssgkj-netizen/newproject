import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { colors, typography } from '@/src/theme/tokens';
import { Home, CalendarClock, FileText, Bell, User, Users, BarChart3, Building2, Settings } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { notificationService } from '@/src/services/api';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '@/src/theme/tokens';

function UnreadBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

function TabBarIcon({ icon: Icon, unreadCount }: { icon: typeof Home; unreadCount?: number }) {
  return (
    <View>
      <Icon size={22} color={colors.blue[500]} strokeWidth={2} />
      {unreadCount !== undefined && unreadCount > 0 && <UnreadBadge count={unreadCount} />}
    </View>
  );
}

export default function TabLayout() {
  const { user, loading } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    notificationService.list({ unreadOnly: true }).then((res) => {
      setUnread(res.items.length);
    }).catch(() => {});
  }, [user]);

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  const role = user.user.role;
  const tabIconColor = colors.blue[500];

  const commonOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.blue[500],
    tabBarInactiveTintColor: colors.text.tertiary,
    tabBarLabelStyle: { fontFamily: typography.fontFamily, fontSize: 11 },
    tabBarStyle: {
      backgroundColor: colors.surface,
      borderTopColor: colors.neutral[100],
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 6,
      paddingTop: 6,
    },
  };

  if (role === 'employee') {
    return (
      <Tabs screenOptions={commonOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="attendance"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color }) => <CalendarClock size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="leave"
          options={{
            title: 'Leave',
            tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Bell} unreadCount={unread} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
          }}
        />
      </Tabs>
    );
  }

  if (role === 'manager') {
    return (
      <Tabs screenOptions={commonOptions}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="team"
          options={{
            title: 'Team',
            tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="approvals"
          options={{
            title: 'Approvals',
            tabBarIcon: ({ color }) => <FileText size={22} color={color} strokeWidth={2} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <TabBarIcon icon={Bell} unreadCount={unread} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
          }}
        />
      </Tabs>
    );
  }

  // admin
  return (
    <Tabs screenOptions={commonOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="branches"
        options={{
          title: 'Branches',
          tabBarIcon: ({ color }) => <Building2 size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          title: 'Employees',
          tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color }) => <BarChart3 size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <TabBarIcon icon={Bell} unreadCount={unread} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.error[500],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.neutral.white,
    fontSize: 10,
    fontFamily: typography.fontFamilyBold,
  },
});
