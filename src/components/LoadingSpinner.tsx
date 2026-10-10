import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/theme';

interface LoadingSpinnerProps {
  label?: string;
  tone?: 'light' | 'dark';
}

export function LoadingSpinner({ label, tone = 'light' }: LoadingSpinnerProps) {
  const isDark = tone === 'dark';

  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={isDark ? colors.textOnDark : colors.textPrimary} />
      {label && (
        <Text
          style={[styles.label, { color: isDark ? colors.textOnDarkMuted : colors.textSecondary }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xxl,
  },
  label: {
    ...typography.label,
  },
});
