import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

// La navegación visible es la isla global (FloatingNav); aquí solo se declaran las rutas.
export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        sceneStyle: { backgroundColor: colors.canvas },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Tickets' }} />
      <Tabs.Screen name="create" options={{ title: 'Nuevo ticket' }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes' }} />
    </Tabs>
  );
}
