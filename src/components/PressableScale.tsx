import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { motion, sizes } from '@/constants/theme';

interface PressableScaleProps {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'tab' | 'link';
  accessibilitySelected?: boolean;
  style?: StyleProp<ViewStyle>;
}

const pressTiming = { duration: motion.press, easing: Easing.bezier(...motion.easeOut) };

// Feedback al presionar (no al soltar) con escala casi imperceptible: se toca decenas de veces.
export function PressableScale({
  children,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilitySelected,
  style,
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => scale.set(withTiming(motion.pressScale, pressTiming))}
      onPressOut={() => scale.set(withTiming(1, pressTiming))}
      disabled={disabled}
      hitSlop={(sizes.touchTarget - sizes.chip) / 2}
      pressRetentionOffset={16}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, selected: accessibilitySelected }}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
