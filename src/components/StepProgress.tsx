import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, gradientDirection, gradients, motion, radii, spacing } from '@/constants/theme';

interface StepProgressProps {
  total: number;
  current: number;
}

const TRACK_HEIGHT = 6;
const fillEasing = Easing.bezier(...motion.easeOut);

function ProgressSegment({ filled }: { filled: boolean }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    const target = filled ? 1 : 0;
    progress.set(
      reduceMotion
        ? target
        : withTiming(target, { duration: motion.indicator, easing: fillEasing }),
    );
  }, [filled, reduceMotion, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.get() }],
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, fillStyle]}>
        <LinearGradient
          colors={gradients.brand}
          start={gradientDirection.start}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Un segmento por paso: completados y actual se llenan, de modo que el avance se lee de un vistazo.
export function StepProgress({ total, current }: StepProgressProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}>
      {Array.from({ length: total }, (_, index) => (
        <ProgressSegment key={index} filled={index <= current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  track: {
    flex: 1,
    height: TRACK_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.ink3,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    transformOrigin: 'left',
  },
});
