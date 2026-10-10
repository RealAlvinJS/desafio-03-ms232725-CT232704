import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, fonts, motion, radii, sizes, spacing, typography } from '@/constants/theme';

interface CustomInputProps extends Pick<
  TextInputProps,
  'placeholder' | 'keyboardType' | 'autoCapitalize' | 'autoCorrect' | 'maxLength' | 'returnKeyType'
> {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  multiline?: boolean;
}

const errorEntering = FadeInUp.duration(motion.chip).withInitialValues({
  opacity: 0,
  transform: [{ translateY: 4 }],
});
const errorExiting = FadeOut.duration(motion.chip);

// Mensaje de validación compartido por inputs y grupos de opciones del formulario.
export function FieldError({ message }: { message: string }) {
  return (
    <Animated.Text
      entering={errorEntering}
      exiting={errorExiting}
      style={styles.error}
      accessibilityLiveRegion="polite">
      {message}
    </Animated.Text>
  );
}

// El borde comunica el estado: morado al enfocar, rojo con error (el error tiene prioridad).
export function CustomInput({
  label,
  value,
  onChangeText,
  error,
  hint,
  multiline = false,
  ...inputProps
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focus = useSharedValue(0);
  const hasError = error !== undefined;

  useEffect(() => {
    focus.set(withTiming(isFocused ? 1 : 0, { duration: motion.chip }));
  }, [isFocused, focus]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: hasError
      ? colors.red
      : interpolateColor(focus.get(), [0, 1], [colors.surface, colors.purple]),
  }));

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View style={[styles.box, multiline && styles.boxMultiline, borderStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.purple}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          style={[styles.input, multiline && styles.inputMultiline]}
          {...inputProps}
        />
      </Animated.View>

      {hasError ? <FieldError message={error} /> : hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginLeft: spacing.xxs,
  },
  box: {
    minHeight: sizes.input,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  boxMultiline: {
    minHeight: sizes.textArea,
    borderRadius: radii.md,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    minHeight: sizes.textArea,
    paddingTop: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.red,
    marginLeft: spacing.xxs,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.xxs,
  },
});
