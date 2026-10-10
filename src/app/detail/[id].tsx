import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Lock, Trash2, UserCheck } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CustomInput } from '@/components/CustomInput';
import { EvidenceImage } from '@/components/EvidenceImage';
import { useTabBarInset } from '@/components/FloatingNav';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SegmentedControl, type SegmentOption } from '@/components/SegmentedControl';
import { StateMessage } from '@/components/StateMessage';
import { TopInsetCover } from '@/components/TopInsetCover';
import { PRIORITY_META, STATUSES, STATUS_META } from '@/constants/tickets';
import { colors, motion, radii, sizes, spacing, typography } from '@/constants/theme';
import { useNavActions } from '@/context/NavActionsContext';
import { useTickets } from '@/context/TicketsContext';
import { useLightStatusBar } from '@/hooks/useLightStatusBar';
import type { TicketStatus, TicketUpdate } from '@/types/Entity';
import { formatFullDate } from '@/utils/format';
import { TICKET_LIMITS, validateAssignee } from '@/utils/validation';

const STATUS_OPTIONS: readonly SegmentOption<TicketStatus>[] = STATUSES.map((status) => ({
  value: status,
  label: STATUS_META[status].label,
}));

const EVIDENCE_HEIGHT = 200;
const DOT_SIZE = 8;
const badgeEntering = FadeIn.duration(motion.crossfade);

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  // Sin tarjeta para controles que ya traen su propia superficie blanca.
  plain?: boolean;
}

function DetailSection({ title, children, plain = false }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {plain ? children : <View style={styles.card}>{children}</View>}
    </View>
  );
}

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { tickets, fetchTicket, editTicket, removeTicket } = useTickets();

  const ticket = tickets.find((item) => item.id === id);
  const [isLoading, setIsLoading] = useState(ticket === undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assigneeDraft, setAssigneeDraft] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useLightStatusBar();

  // Siempre se consulta el servidor por id: lo que haya en memoria solo sirve para pintar al instante.
  useEffect(() => {
    let isActive = true;

    fetchTicket(id)
      .then(() => {
        if (isActive) {
          setLoadError(null);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'No se pudo cargar el ticket.');
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [id, fetchTicket]);

  const isResolved = ticket?.status === 'resolved';
  const assigneeValue = assigneeDraft ?? ticket?.assignee ?? '';
  const assigneeError = assigneeDraft !== null ? validateAssignee(assigneeDraft) : undefined;
  // Un ticket resuelto no se reasigna; además el nombre debe cambiar y ser válido.
  const canReassign =
    ticket !== undefined &&
    !isResolved &&
    assigneeDraft !== null &&
    assigneeError === undefined &&
    assigneeDraft.trim() !== ticket.assignee;

  const runUpdate = async (changes: TicketUpdate) => {
    setIsSaving(true);
    try {
      await editTicket(id, changes);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAssigneeDraft(null);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'No se pudo actualizar',
        error instanceof Error ? error.message : 'Intenta de nuevo.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  // El flujo de estados es libre, pero todo cambio requiere confirmación explícita.
  const handleStatusChange = (next: TicketStatus) => {
    if (!ticket || next === ticket.status || isSaving) {
      return;
    }
    const from = STATUS_META[ticket.status].label;
    const to = STATUS_META[next].label;
    Alert.alert('Cambiar estado', `¿Mover el ticket de "${from}" a "${to}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cambiar', onPress: () => runUpdate({ status: next }) },
    ]);
  };

  const handleReassign = () => {
    if (!canReassign || !ticket || assigneeDraft === null) {
      return;
    }
    const nextAssignee = assigneeDraft.trim();
    Alert.alert('Reasignar ticket', `¿Asignar el ticket a ${nextAssignee}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Reasignar', onPress: () => runUpdate({ assignee: nextAssignee }) },
    ]);
  };

  const handleDelete = () => {
    if (!ticket) {
      return;
    }
    Alert.alert('Eliminar ticket', `"${ticket.title}" se eliminará de forma permanente.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await removeTicket(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.back();
          } catch (error) {
            setIsDeleting(false);
            Alert.alert(
              'No se pudo eliminar',
              error instanceof Error ? error.message : 'Intenta de nuevo.',
            );
          }
        },
      },
    ]);
  };

  useNavActions({
    primary: canReassign
      ? { label: 'Reasignar', icon: UserCheck, onPress: handleReassign, loading: isSaving }
      : undefined,
  });

  if (!ticket) {
    return (
      <View style={styles.centered}>
        {isLoading || isDeleting ? (
          <LoadingSpinner label={isDeleting ? 'Eliminando…' : 'Cargando ticket…'} />
        ) : (
          <StateMessage
            variant="error"
            title="No se encontró el ticket"
            message={loadError ?? 'El ticket no existe o fue eliminado.'}
            action={{ label: 'Volver', icon: ArrowLeft, onPress: () => router.back() }}
          />
        )}
      </View>
    );
  }

  const priority = PRIORITY_META[ticket.priority];

  return (
    <View style={styles.screen}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerTop}>
            <View style={styles.priority}>
              <View style={[styles.dot, { backgroundColor: priority.color }]} />
              <Text style={styles.priorityLabel}>Prioridad {priority.label.toLowerCase()}</Text>
            </View>
            <Animated.View key={ticket.status} entering={badgeEntering}>
              <Badge status={ticket.status} tone="dark" />
            </Animated.View>
          </View>

          <Text style={styles.title}>{ticket.title}</Text>

          <View style={styles.meta}>
            <View style={styles.department}>
              <Text style={styles.departmentText}>{ticket.category}</Text>
            </View>
            <Text style={styles.metaText}>
              #{ticket.id} · {formatFullDate(ticket.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <DetailSection title="Estado" plain>
            <SegmentedControl
              options={STATUS_OPTIONS}
              value={ticket.status}
              onChange={handleStatusChange}
              accessibilityLabel="Estado del ticket"
            />
          </DetailSection>

          <DetailSection title="Descripción">
            <Text style={styles.body1}>{ticket.description}</Text>
          </DetailSection>

          <DetailSection title="Evidencia">
            {ticket.imageUrl ? (
              <EvidenceImage uri={ticket.imageUrl} height={EVIDENCE_HEIGHT} />
            ) : (
              <Text style={styles.muted}>Sin evidencia adjunta.</Text>
            )}
          </DetailSection>

          <DetailSection title="Responsable">
            {isResolved ? (
              <View style={styles.locked}>
                <Text style={styles.body1}>{ticket.assignee}</Text>
                <View style={styles.lockedNote}>
                  <Lock
                    color={colors.textSecondary}
                    size={sizes.iconSmall}
                    strokeWidth={sizes.iconStroke}
                  />
                  <Text style={styles.muted}>Los tickets resueltos no se pueden reasignar.</Text>
                </View>
              </View>
            ) : (
              <CustomInput
                label="Responsable asignado"
                hideLabel
                tone="muted"
                value={assigneeValue}
                onChangeText={setAssigneeDraft}
                error={assigneeError}
                hint={canReassign ? 'Pulsa "Reasignar" para guardar el cambio.' : undefined}
                maxLength={TICKET_LIMITS.assigneeMax}
                autoCapitalize="words"
              />
            )}
          </DetailSection>

          <Button
            label="Eliminar ticket"
            icon={Trash2}
            variant="destructive"
            onPress={handleDelete}
            disabled={isSaving || isDeleting}
          />
        </View>
      </ScrollView>
      <TopInsetCover color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.canvas,
  },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    ...typography.title,
    color: colors.textOnDark,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  department: {
    backgroundColor: colors.ink3,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
  },
  departmentText: {
    ...typography.caption,
    color: colors.textOnDark,
  },
  metaText: {
    ...typography.caption,
    color: colors.textOnDarkMuted,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginLeft: spacing.xxs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  body1: {
    ...typography.body,
    color: colors.textPrimary,
  },
  muted: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  locked: {
    gap: spacing.xs,
  },
  lockedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
