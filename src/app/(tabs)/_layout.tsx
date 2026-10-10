import { Tabs } from 'expo-router';
import { Plus, Settings, Ticket } from 'lucide-react-native';

import { colors, fonts, sizes } from '@/constants/theme';

// TabBar nativo provisional; en H3 se reemplaza por el navbar flotante animado.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: fonts.medium },
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
          title: 'Nuevo',
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
