import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { colors, radii, spacing, typography } from '@/constants/theme';

const DOT_SIZE = 8;
const BANNER_DURATION = 200;
const OFFSET = -8;

const entering = FadeInDown.duration(BANNER_DURATION).withInitialValues({
  opacity: 0,
  transform: [{ translateY: OFFSET }],
});
const exiting = FadeOutUp.duration(BANNER_DURATION);

// Informa sin bloquear: la lista guardada sigue siendo navegable debajo.
export function OfflineBanner() {
  return (
    <Animated.View
      entering={entering}
      exiting={exiting}
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <View style={styles.dot} />
      <Text style={styles.text}>Sin conexión · mostrando datos guardados</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.ink3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.amber,
  },
  text: {
    ...typography.caption,
    color: colors.textOnDark,
  },
});
