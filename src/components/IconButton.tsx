import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { colors, radii, sizes } from '@/constants/theme';

import { PressableScale } from './PressableScale';

const SMALL_SIZE = 40;

interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // light: sobre canvas · muted: sobre superficies blancas · dark: sobre la zona negra.
  tone?: 'light' | 'muted' | 'dark';
  iconColor?: string;
  size?: 'md' | 'sm';
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  tone = 'light',
  iconColor,
  size = 'md',
}: IconButtonProps) {
  const isDark = tone === 'dark';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, size === 'sm' && styles.small, styles[tone]]}>
      <Icon
        color={iconColor ?? (isDark ? colors.textOnDark : colors.textPrimary)}
        size={size === 'sm' ? sizes.iconSmall + 2 : sizes.icon}
        strokeWidth={sizes.iconStroke}
      />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    width: SMALL_SIZE,
    height: SMALL_SIZE,
  },
  light: {
    backgroundColor: colors.surface,
  },
  muted: {
    backgroundColor: colors.surfaceMuted,
  },
  dark: {
    backgroundColor: colors.ink3,
  },
});
