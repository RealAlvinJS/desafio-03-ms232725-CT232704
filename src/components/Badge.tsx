import { CircleCheck, CircleDot, LoaderCircle, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { STATUS_META } from '@/constants/tickets';
import { colors, radii, sizes, spacing, typography } from '@/constants/theme';
import type { TicketStatus } from '@/types/Entity';

interface BadgeProps {
  status: TicketStatus;
  tone?: 'light' | 'dark';
}

const STATUS_ICONS: Record<TicketStatus, LucideIcon> = {
  open: CircleDot,
  in_progress: LoaderCircle,
  resolved: CircleCheck,
};

// El estado va como pill outline con ícono de color, para no competir con el dot de prioridad.
export function Badge({ status, tone = 'light' }: BadgeProps) {
  const Icon = STATUS_ICONS[status];
  const { label, color } = STATUS_META[status];
  const isDark = tone === 'dark';

  return (
    <View style={[styles.badge, isDark ? styles.dark : styles.light]}>
      <Icon color={color} size={sizes.iconSmall} strokeWidth={sizes.iconStroke} />
      <Text style={[styles.label, isDark ? styles.labelDark : styles.labelLight]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xxs + 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  light: {
    borderColor: colors.border,
  },
  dark: {
    borderColor: colors.ink3,
  },
  label: {
    ...typography.caption,
  },
  labelLight: {
    color: colors.textSecondary,
  },
  labelDark: {
    color: colors.textOnDarkMuted,
  },
});
