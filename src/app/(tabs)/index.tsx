import { Link } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { colors, typography } from '@/constants/theme';

export default function TicketsScreen() {
  return (
    <ScreenPlaceholder title="Tickets" milestone="H4">
      <Link href={{ pathname: '/detail/[id]', params: { id: '1' } }} style={styles.link}>
        <Text>Abrir detalle de prueba (id 1)</Text>
      </Link>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  link: {
    ...typography.label,
    color: colors.purple,
  },
});
