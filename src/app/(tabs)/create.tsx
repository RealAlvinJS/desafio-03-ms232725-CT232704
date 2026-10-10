import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CustomInput, FieldError } from '@/components/CustomInput';
import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { GradientButton } from '@/components/GradientButton';
import { useTabBarInset } from '@/components/TabBar';
import { TopInsetCover } from '@/components/TopInsetCover';
import { INITIAL_STATUS, PRIORITIES, PRIORITY_META } from '@/constants/tickets';
import { colors, radii, spacing, typography } from '@/constants/theme';
import { useDepartments } from '@/context/DepartmentsContext';
import { useTickets } from '@/context/TicketsContext';
import type { TicketPriority } from '@/types/Entity';
import {
  EMPTY_TICKET_FORM,
  TICKET_LIMITS,
  hasErrors,
  validateTicket,
  type TicketForm,
} from '@/utils/validation';

const PRIORITY_OPTIONS: readonly ChipOption<TicketPriority>[] = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_META[priority].label,
  color: PRIORITY_META[priority].color,
}));

interface ChoiceFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function ChoiceField({ label, error, children }: ChoiceFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error && <FieldError message={error} />}
    </View>
  );
}

export default function CreateTicketScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { addTicket } = useTickets();
  const { departments } = useDepartments();

  const [form, setForm] = useState<TicketForm>(EMPTY_TICKET_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Los errores aparecen tras el primer intento de envío y luego se recalculan en vivo.
  const errors = submitted ? validateTicket(form) : {};

  const departmentOptions: ChipOption<string>[] = departments.map((department) => ({
    value: department.name,
    label: department.name,
  }));

  const updateField =
    <K extends keyof TicketForm>(key: K) =>
    (value: TicketForm[K]) =>
      setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async () => {
    setSubmitted(true);

    if (hasErrors(validateTicket(form)) || !form.priority) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSaving(true);
    try {
      await addTicket({
        title: form.title.trim(),
        category: form.category,
        priority: form.priority,
        description: form.description.trim(),
        assignee: form.assignee.trim(),
        imageUrl: form.imageUrl.trim() || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setForm(EMPTY_TICKET_FORM);
      setSubmitted(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      router.navigate('/');
    } catch (error) {
      Alert.alert(
        'No se pudo crear el ticket',
        error instanceof Error ? error.message : 'Intenta de nuevo.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: tabBarInset },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title}>Nuevo ticket</Text>
          <Text style={styles.subtitle}>Reporta una falla o solicitud de soporte</Text>
        </View>

        <View style={styles.form}>
          <CustomInput
            label="Título del problema"
            placeholder="Ej. La impresora no imprime"
            value={form.title}
            onChangeText={updateField('title')}
            error={errors.title}
            maxLength={TICKET_LIMITS.titleMax}
            autoCapitalize="sentences"
          />

          <ChoiceField label="Departamento" error={errors.category}>
            {departmentOptions.length > 0 ? (
              <FilterChips
                options={departmentOptions}
                value={form.category || null}
                onChange={updateField('category')}
                layout="wrap"
              />
            ) : (
              <View style={styles.emptyDepartments}>
                <Text style={styles.emptyText}>
                  No hay departamentos registrados. Agrega uno para poder crear tickets.
                </Text>
                <Button
                  label="Ir a Ajustes"
                  icon={Settings}
                  onPress={() => router.navigate('/settings')}
                />
              </View>
            )}
          </ChoiceField>

          <ChoiceField label="Prioridad" error={errors.priority}>
            <FilterChips
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={updateField('priority')}
              layout="wrap"
            />
          </ChoiceField>

          <CustomInput
            label="Descripción del fallo"
            placeholder="¿Qué ocurre, desde cuándo y qué ya se intentó?"
            value={form.description}
            onChangeText={updateField('description')}
            error={errors.description}
            hint={`${form.description.trim().length}/${TICKET_LIMITS.descriptionMax}`}
            maxLength={TICKET_LIMITS.descriptionMax}
            multiline
          />

          <CustomInput
            label="Responsable asignado"
            placeholder="Ej. Carlos Méndez"
            value={form.assignee}
            onChangeText={updateField('assignee')}
            error={errors.assignee}
            maxLength={TICKET_LIMITS.assigneeMax}
            autoCapitalize="words"
          />

          <CustomInput
            label="URL de evidencia (opcional)"
            placeholder="https://…"
            value={form.imageUrl}
            onChangeText={updateField('imageUrl')}
            error={errors.imageUrl}
            hint="Captura o foto del problema, en HTTPS."
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.initialStatus}>
            <Text style={styles.initialStatusText}>Se registrará como</Text>
            <Badge status={INITIAL_STATUS} />
          </View>
          <GradientButton
            label="Crear ticket"
            icon={Plus}
            loading={isSaving}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>
      <TopInsetCover />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    paddingHorizontal: spacing.gutter,
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xxs,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textPrimary,
    marginLeft: spacing.xxs,
  },
  emptyDepartments: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  footer: {
    gap: spacing.md,
  },
  initialStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  initialStatusText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
