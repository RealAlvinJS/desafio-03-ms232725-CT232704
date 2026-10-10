import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { colors, typography } from '@/constants/theme';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenPlaceholder title={`Ticket #${id}`} milestone="H6">
      <Text style={styles.link} onPress={() => router.back()}>
        Volver
      </Text>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  link: {
    ...typography.label,
    color: colors.purple,
  },
});
