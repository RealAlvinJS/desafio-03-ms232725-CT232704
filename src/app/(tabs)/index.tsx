import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { Logo } from '@/components/Logo';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { StateMessage } from '@/components/StateMessage';
import { colors, radii, spacing, typography } from '@/constants/theme';

export default function TicketsScreen() {
  return (
    <ScreenPlaceholder title="Tickets" milestone="H4">
      <View style={styles.row}>
        <View style={styles.logoCircle}>
          <Logo size={32} />
        </View>
        <Badge status="open" />
        <Badge status="in_progress" />
        <Badge status="resolved" />
      </View>
      <Link href={{ pathname: '/detail/[id]', params: { id: '1' } }} style={styles.link}>
        <Text>Abrir detalle de prueba (id 1)</Text>
      </Link>
      <View style={styles.darkZone}>
        <StateMessage
          variant="empty"
          tone="dark"
          title="Sin tickets"
          message="Cuando alguien reporte un problema aparecerá aquí."
        />
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    ...typography.label,
    color: colors.purple,
  },
  darkZone: {
    backgroundColor: colors.ink,
    borderRadius: radii.xl,
  },
});
