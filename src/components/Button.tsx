import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';

import { colors, radii, sizes, spacing, typography } from '@/constants/theme';

import { PressableScale } from './PressableScale';

// secondary: negro sobre fondos claros · inverse: blanco sobre la zona negra · outline: acción menor.
type ButtonVariant = 'secondary' | 'inverse' | 'outline' | 'destructive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
}

const VARIANT_COLORS: Record<ButtonVariant, { text: string }> = {
  secondary: { text: colors.textOnDark },
  inverse: { text: colors.textPrimary },
  outline: { text: colors.textPrimary },
  destructive: { text: colors.red },
};

// El CTA principal es GradientButton; este cubre acciones secundarias y destructivas.
export function Button({
  label,
  onPress,
  variant = 'secondary',
  icon: Icon,
  disabled = false,
}: ButtonProps) {
  const textColor = VARIANT_COLORS[variant].text;

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[styles.button, styles[variant], disabled && styles.disabled]}>
      {Icon && <Icon color={textColor} size={sizes.icon} strokeWidth={sizes.iconStroke} />}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    height: sizes.button,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  secondary: {
    backgroundColor: colors.ink,
  },
  inverse: {
    backgroundColor: colors.surface,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: colors.ink,
  },
  destructive: {
    borderWidth: 1.5,
    borderColor: colors.red,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.label,
  },
});
