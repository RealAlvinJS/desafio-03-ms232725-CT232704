import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii, sizes, spacing, typography } from '@/constants/theme';

import { PressableScale } from './PressableScale';

interface ChoiceCardProps {
  title: string;
  description: string;
  color: string;
  selected: boolean;
  onPress: () => void;
}

const DOT_SIZE = 12;
const CHECK_SIZE = 24;

// Opción grande para decisiones con matiz (como la urgencia), donde un chip no alcanza a explicar.
export function ChoiceCard({ title, description, color, selected, onPress }: ChoiceCardProps) {
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, { duration: motion.chip }));
  }, [selected, progress]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [colors.surface, color]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ scale: 0.8 + progress.get() * 0.2 }],
  }));

  const handlePress = () => {
    if (!selected) {
      Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityLabel={title}
      accessibilitySelected={selected}>
      <Animated.View style={[styles.card, borderStyle]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <View style={styles.texts}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        <Animated.View style={[styles.check, { backgroundColor: color }, checkStyle]}>
          <Check color={colors.textOnDark} size={sizes.iconSmall} strokeWidth={2.5} />
        </Animated.View>
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
    backgroundColor: colors.surface,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
  texts: {
    flex: 1,
    gap: spacing.xxs,
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  description: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  check: {
    width: CHECK_SIZE,
    height: CHECK_SIZE,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
