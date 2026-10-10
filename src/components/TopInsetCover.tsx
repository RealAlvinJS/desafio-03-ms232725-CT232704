import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';

interface TopInsetCoverProps {
  color?: string;
}

// Tapa la zona de la barra de estado para que el contenido no se lea detrás de la hora al hacer scroll.
export function TopInsetCover({ color = colors.canvas }: TopInsetCoverProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="none"
      style={[styles.cover, { height: insets.top, backgroundColor: color }]}
    />
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
