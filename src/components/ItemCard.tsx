import { Clock, UserRound } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { PRIORITY_META } from '@/constants/tickets';
import { colors, radii, sizes, spacing, typography } from '@/constants/theme';
import type { Ticket } from '@/types/Entity';
import { formatRelativeDate } from '@/utils/format';

import { Badge } from './Badge';
import { PressableScale } from './PressableScale';

interface ItemCardProps {
  ticket: Ticket;
  onPress: (id: string) => void;
}

const DOT_SIZE = 8;

export function ItemCard({ ticket, onPress }: ItemCardProps) {
  const priority = PRIORITY_META[ticket.priority];

  return (
    <PressableScale
      onPress={() => onPress(ticket.id)}
      accessibilityLabel={`${ticket.title}, prioridad ${priority.label}`}
      style={styles.card}>
      <View style={styles.header}>
        <View style={styles.priority}>
          <View style={[styles.dot, { backgroundColor: priority.color }]} />
          <Text style={styles.priorityLabel}>{priority.label}</Text>
        </View>
        <Badge status={ticket.status} tone="dark" />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      <View style={styles.meta}>
        <UserRound
          color={colors.textOnDarkMuted}
          size={sizes.iconSmall}
          strokeWidth={sizes.iconStroke}
        />
        <Text style={styles.metaText} numberOfLines={1}>
          {ticket.assignee || 'Sin asignar'}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.department}>
          <Text style={styles.departmentText} numberOfLines={1}>
            {ticket.category}
          </Text>
        </View>
        <View style={styles.meta}>
          <Clock
            color={colors.textOnDarkMuted}
            size={sizes.iconSmall}
            strokeWidth={sizes.iconStroke}
          />
          <Text style={styles.metaText}>{formatRelativeDate(ticket.createdAt)}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.ink2,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
  priorityLabel: {
    ...typography.label,
    color: colors.textOnDark,
  },
  title: {
    ...typography.heading,
    color: colors.textOnDark,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
    flexShrink: 1,
  },
  metaText: {
    ...typography.caption,
    color: colors.textOnDarkMuted,
    flexShrink: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.ink3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  department: {
    flexShrink: 1,
    backgroundColor: colors.ink3,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  departmentText: {
    ...typography.caption,
    color: colors.textOnDark,
  },
});
