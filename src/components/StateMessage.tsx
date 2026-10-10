import { TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { colors, motion, spacing, typography } from '@/constants/theme';

import { Button } from './Button';
import { Logo } from './Logo';

interface StateMessageProps {
  variant: 'empty' | 'error';
  title: string;
  message: string;
  tone?: 'light' | 'dark';
  action?: {
    label: string;
    icon?: LucideIcon;
    onPress: () => void;
  };
}

const LOGO_SIZE = 64;
const ERROR_ICON_SIZE = 40;

// Momento poco frecuente: aquí sí cabe una entrada más notoria (fade + escala desde 0.95).
const containerEntering = FadeIn.duration(motion.emptyState);
const iconEntering = ZoomIn.duration(motion.emptyState).withInitialValues({
  transform: [{ scale: motion.enterScale }],
});

export function StateMessage({
  variant,
  title,
  message,
  tone = 'light',
  action,
}: StateMessageProps) {
  const isDark = tone === 'dark';
  const background = isDark ? colors.ink : colors.canvas;

  return (
    <Animated.View entering={containerEntering} style={styles.container}>
      <Animated.View entering={iconEntering}>
        {variant === 'empty' ? (
          <Logo size={LOGO_SIZE} backgroundColor={background} />
        ) : (
          <TriangleAlert color={colors.red} size={ERROR_ICON_SIZE} strokeWidth={1.5} />
        )}
      </Animated.View>

      <Text style={[styles.title, { color: isDark ? colors.textOnDark : colors.textPrimary }]}>
        {title}
      </Text>
      <Text
        style={[styles.message, { color: isDark ? colors.textOnDarkMuted : colors.textSecondary }]}>
        {message}
      </Text>

      {action && (
        <Button
          label={action.label}
          icon={action.icon}
          variant={isDark ? 'inverse' : 'secondary'}
          onPress={action.onPress}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
  },
  title: {
    ...typography.heading,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  message: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
