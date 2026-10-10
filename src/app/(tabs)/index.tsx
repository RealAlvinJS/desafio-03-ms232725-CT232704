import { router } from 'expo-router';
import { FilterX, RotateCw, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { IconButton } from '@/components/IconButton';
import { ItemCard } from '@/components/ItemCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Logo } from '@/components/Logo';
import { OfflineBanner } from '@/components/OfflineBanner';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { StatCard } from '@/components/StatCard';
import { StateMessage } from '@/components/StateMessage';
import { useTabBarInset } from '@/components/TabBar';
import { PRIORITIES, PRIORITY_META, STATUSES, STATUS_META } from '@/constants/tickets';
import { colors, gradients, motion, radii, sizes, spacing, typography } from '@/constants/theme';
import { useTickets } from '@/context/TicketsContext';
import type { Ticket } from '@/types/Entity';
import {
  NO_FILTERS,
  countBy,
  filterTickets,
  sortTickets,
  type PriorityFilter,
  type StatusFilter,
  type TicketFilters,
} from '@/utils/tickets';

const STATUS_OPTIONS: readonly SegmentOption<StatusFilter>[] = [
  { value: 'all', label: 'Todos' },
  ...STATUSES.map((status) => ({ value: status, label: STATUS_META[status].label })),
];

const PRIORITY_OPTIONS: readonly ChipOption<PriorityFilter>[] = [
  { value: 'all', label: 'Todas' },
  ...PRIORITIES.map((priority) => ({
    value: priority,
    label: PRIORITY_META[priority].label,
    color: PRIORITY_META[priority].color,
  })),
];

// La lista entra una sola vez al montarse; los reacomodos por filtro usan layout animation.
const listEntering = FadeInDown.duration(motion.enter).withInitialValues({
  opacity: 0,
  transform: [{ translateY: 8 }],
});
const itemLayout = LinearTransition.duration(200);

function Separator() {
  return <View style={styles.separator} />;
}

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { tickets, status, error, isOffline, isRefreshing, fetchTickets } = useTickets();
  const [filters, setFilters] = useState<TicketFilters>(NO_FILTERS);

  const visibleTickets = sortTickets(filterTickets(tickets, filters));
  const openCount = countBy(tickets, 'status', 'open');
  const highCount = countBy(tickets, 'priority', 'high');
  const hasFilters = filters.status !== 'all' || filters.priority !== 'all';

  const openDetail = (id: string) => router.push({ pathname: '/detail/[id]', params: { id } });

  // Los stat cards alternan su filtro: tocar uno activo lo quita.
  const toggleStatus = (value: StatusFilter) =>
    setFilters((current) => ({ ...current, status: current.status === value ? 'all' : value }));
  const togglePriority = (value: PriorityFilter) =>
    setFilters((current) => ({ ...current, priority: current.priority === value ? 'all' : value }));

  const renderItem = ({ item }: { item: Ticket }) => (
    <ItemCard ticket={item} onPress={openDetail} />
  );

  const listHeader = (
    <View style={styles.listHeader}>
      {isOffline && <OfflineBanner />}
      <SegmentedControl
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
        tone="dark"
        accessibilityLabel="Filtrar por estado"
      />
      <FilterChips
        options={PRIORITY_OPTIONS}
        value={filters.priority}
        onChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
        tone="dark"
      />
      <View style={styles.sectionTitle}>
        <Text style={styles.sectionHeading}>Tickets</Text>
        <Text style={styles.sectionCount}>
          {visibleTickets.length} de {tickets.length}
        </Text>
      </View>
    </View>
  );

  const listEmpty = hasFilters ? (
    <StateMessage
      variant="empty"
      tone="dark"
      title="Sin resultados"
      message="Ningún ticket coincide con los filtros seleccionados."
      action={{ label: 'Limpiar filtros', icon: FilterX, onPress: () => setFilters(NO_FILTERS) }}
    />
  ) : (
    <StateMessage
      variant="empty"
      tone="dark"
      title="Sin tickets"
      message="Cuando alguien reporte un problema aparecerá aquí."
    />
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Logo size={28} />
          </View>
          <View style={styles.brandTexts}>
            <Text style={styles.brandName}>TicketTracker</Text>
            <Text style={styles.brandCaption}>Mesa de ayuda</Text>
          </View>
          <IconButton
            icon={Settings}
            tone="muted"
            accessibilityLabel="Abrir ajustes"
            onPress={() => router.navigate('/settings')}
          />
        </View>

        <View style={styles.stats}>
          <StatCard
            value={openCount}
            label="Abiertos"
            gradient={gradients.purpleLead}
            active={filters.status === 'open'}
            onPress={() => toggleStatus('open')}
          />
          <StatCard
            value={highCount}
            label="Alta prioridad"
            gradient={gradients.redLead}
            active={filters.priority === 'high'}
            onPress={() => togglePriority('high')}
          />
        </View>
      </View>

      {status === 'loading' && <LoadingSpinner tone="dark" label="Cargando tickets…" />}

      {status === 'error' && (
        <View style={styles.centered}>
          <StateMessage
            variant="error"
            tone="dark"
            title="No se pudieron cargar los tickets"
            message={error ?? 'Ocurrió un error inesperado.'}
            action={{ label: 'Reintentar', icon: RotateCw, onPress: () => fetchTickets() }}
          />
        </View>
      )}

      {status === 'ready' && (
        <Animated.View entering={listEntering} style={styles.listWrapper}>
          <Animated.FlatList
            data={visibleTickets}
            keyExtractor={(ticket) => ticket.id}
            renderItem={renderItem}
            itemLayoutAnimation={itemLayout}
            ItemSeparatorComponent={Separator}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={[styles.listContent, { paddingBottom: tabBarInset }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={() => fetchTickets({ refreshing: true })}
                tintColor={colors.textOnDark}
              />
            }
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    gap: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoCircle: {
    width: sizes.iconButton,
    height: sizes.iconButton,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTexts: {
    flex: 1,
  },
  brandName: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  brandCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  listWrapper: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sectionHeading: {
    ...typography.heading,
    color: colors.textOnDark,
  },
  sectionCount: {
    ...typography.caption,
    color: colors.textOnDarkMuted,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    height: spacing.md,
  },
});
