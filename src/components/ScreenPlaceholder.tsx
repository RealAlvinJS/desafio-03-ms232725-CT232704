import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '@/constants/theme';

interface ScreenPlaceholderProps {
  title: string;
  milestone: string;
  children?: ReactNode;
}

// Temporal: cada pantalla lo reemplaza al implementarse en su hito.
export function ScreenPlaceholder({ title, milestone, children }: ScreenPlaceholderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.caption}>Pendiente · {milestone}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: spacing.gutter,
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
