import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion, radii, sizes, spacing, typography } from '@/constants/theme';

import { PressableScale } from './PressableScale';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
  color?: string;
}

interface FilterChipsProps<T extends string> {
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: 'light' | 'dark';
}

interface ChipProps {
  label: string;
  color?: string;
  selected: boolean;
  tone: 'light' | 'dark';
  onPress: () => void;
}

const DOT_SIZE = 8;

function Chip({ label, color, selected, tone, onPress }: ChipProps) {
  const isDark = tone === 'dark';
  const idleBorder = isDark ? colors.ink3 : colors.surfaceMuted;
  const activeBorder = color ?? (isDark ? colors.textOnDark : colors.textPrimary);
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.set(withTiming(selected ? 1 : 0, { duration: motion.chip }));
  }, [selected, progress]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(progress.get(), [0, 1], [idleBorder, activeBorder]),
  }));

  return (
    <PressableScale onPress={onPress} accessibilityLabel={label} accessibilitySelected={selected}>
      <Animated.View
        style={[styles.chip, isDark ? styles.chipDark : styles.chipLight, borderStyle]}>
        {color && <View style={[styles.dot, { backgroundColor: color }]} />}
        <Text
          style={[
            styles.label,
            { color: isDark ? colors.textOnDark : colors.textPrimary },
            !selected && { color: isDark ? colors.textOnDarkMuted : colors.textSecondary },
          ]}>
          {label}
        </Text>
      </Animated.View>
    </PressableScale>
  );
}

// Selección única: volver a tocar el chip activo no lo desmarca, para eso existe la opción "Todas".
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  tone = 'light',
}: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          color={option.color}
          tone={tone}
          selected={option.value === value}
          onPress={() => {
            if (option.value !== value) {
              Haptics.selectionAsync();
              onChange(option.value);
            }
          }}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.xs,
  },
  chip: {
    height: sizes.chip,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1.5,
  },
  chipLight: {
    backgroundColor: colors.surfaceMuted,
  },
  chipDark: {
    backgroundColor: colors.ink3,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
  label: {
    ...typography.label,
  },
});
