import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii, sizes, spacing, typography } from '@/constants/theme';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: 'light' | 'dark';
  accessibilityLabel: string;
}

const PADDING = 4;

// En tono claro el pill es negro; en oscuro es blanco, así que el texto activo se invierte.
function labelColor(isDark: boolean, isSelected: boolean): string {
  if (isDark) {
    return isSelected ? colors.textPrimary : colors.textOnDarkMuted;
  }
  return isSelected ? colors.textOnDark : colors.textSecondary;
}
const indicatorEasing = Easing.bezier(...motion.easeInOut);

// El pill es absoluto y sin hijos: se desliza con transform sin re-calcular el layout de las opciones.
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const [width, setWidth] = useState(0);
  const reduceMotion = useReducedMotion();
  const indicatorX = useSharedValue(0);

  const segmentWidth = options.length > 0 ? (width - PADDING * 2) / options.length : 0;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    const target = selectedIndex * segmentWidth;
    indicatorX.set(
      reduceMotion
        ? target
        : withTiming(target, { duration: motion.indicator, easing: indicatorEasing }),
    );
  }, [selectedIndex, segmentWidth, reduceMotion, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.get() }],
  }));

  const handleLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);
  const isDark = tone === 'dark';

  return (
    <View
      onLayout={handleLayout}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
      {width > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            isDark && styles.indicatorDark,
            { width: segmentWidth },
            indicatorStyle,
          ]}
        />
      )}

      {options.map((option) => {
        const isSelected = option.value === value;
        const handlePress = () => {
          if (!isSelected) {
            Haptics.selectionAsync();
            onChange(option.value);
          }
        };

        return (
          <Pressable
            key={option.value}
            onPress={handlePress}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={styles.option}>
            <Text
              numberOfLines={1}
              style={[styles.label, { color: labelColor(isDark, isSelected) }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: PADDING,
    borderRadius: radii.pill,
  },
  containerLight: {
    backgroundColor: colors.surface,
  },
  containerDark: {
    backgroundColor: colors.ink2,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  indicatorDark: {
    backgroundColor: colors.surface,
  },
  option: {
    flex: 1,
    height: sizes.chip + spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxs,
  },
  label: {
    ...typography.label,
  },
});
