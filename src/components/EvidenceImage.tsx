import { Image } from 'expo-image';
import { ImageOff } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/constants/theme';

interface EvidenceImageProps {
  uri: string;
  height: number;
}

// Una URL de evidencia puede romperse con el tiempo: se informa en vez de dejar un recuadro vacío.
export function EvidenceImage({ uri, height }: EvidenceImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[styles.frame, styles.fallback, { height }]}>
        <ImageOff color={colors.textSecondary} size={sizes.icon} strokeWidth={sizes.iconStroke} />
        <Text style={styles.caption}>No se pudo cargar la evidencia</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.frame, { height }]}
      contentFit="cover"
      transition={200}
      onError={() => setHasError(true)}
      accessibilityLabel="Evidencia del problema"
    />
  );
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    borderRadius: radii.md,
    backgroundColor: colors.surfaceMuted,
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
