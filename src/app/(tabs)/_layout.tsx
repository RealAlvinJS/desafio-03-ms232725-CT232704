import { Tabs } from 'expo-router';
import { Plus, Settings, Ticket } from 'lucide-react-native';

import { TabBar } from '@/components/TabBar';
import { colors, sizes } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        sceneStyle: { backgroundColor: colors.canvas },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tickets',
          tabBarIcon: ({ color }) => (
            <Ticket color={color} size={sizes.icon} strokeWidth={sizes.iconStroke} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Nuevo ticket',
          tabBarIcon: ({ color }) => (
            <Plus color={color} size={sizes.icon} strokeWidth={sizes.iconStroke} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Settings color={color} size={sizes.icon} strokeWidth={sizes.iconStroke} />
          ),
        }}
      />
    </Tabs>
  );
}
