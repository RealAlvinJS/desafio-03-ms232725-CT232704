import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

import { colors, radii, sizes } from '@/constants/theme';

import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress: () => void;
  // light: sobre canvas · muted: sobre superficies blancas · dark: sobre la zona negra.
  tone?: 'light' | 'muted' | 'dark';
  iconColor?: string;
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  tone = 'light',
  iconColor,
}: IconButtonProps) {
  const isDark = tone === 'dark';

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, styles[tone]]}>
      <Icon
        color={iconColor ?? (isDark ? colors.textOnDark : colors.textPrimary)}
        size={sizes.icon}
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
