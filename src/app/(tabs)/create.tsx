import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientButton } from '@/components/GradientButton';
import { ScreenPlaceholder } from '@/components/ScreenPlaceholder';
import { StateMessage } from '@/components/StateMessage';
import { spacing } from '@/constants/theme';

export default function CreateTicketScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <ScreenPlaceholder title="Nuevo ticket" milestone="H5">
      <View style={styles.stack}>
        <GradientButton
          label="Crear ticket"
          icon={Plus}
          loading={loading}
          onPress={() => setLoading(true)}
        />
        <Button label="Detener carga" onPress={() => setLoading(false)} />
        <Button label="Eliminar" variant="destructive" icon={Trash2} onPress={() => undefined} />
        <StateMessage
          variant="error"
          title="Sin conexión"
          message="No hay conexión con el servidor."
          action={{ label: 'Reintentar', onPress: () => undefined }}
        />
      </View>
    </ScreenPlaceholder>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
});
