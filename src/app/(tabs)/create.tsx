import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { ArrowLeft, ArrowRight, Plus, Settings } from 'lucide-react-native';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ChoiceCard } from '@/components/ChoiceCard';
import { CustomInput, FieldError } from '@/components/CustomInput';
import { FilterChips, type ChipOption } from '@/components/FilterChips';
import { GradientButton } from '@/components/GradientButton';
import { StepProgress } from '@/components/StepProgress';
import { useTabBarInset } from '@/components/TabBar';
import { TicketReview } from '@/components/TicketReview';
import { TopInsetCover } from '@/components/TopInsetCover';
import { PRIORITIES, PRIORITY_DESCRIPTIONS, PRIORITY_META } from '@/constants/tickets';
import { colors, motion, radii, sizes, spacing, typography } from '@/constants/theme';
import { useDepartments } from '@/context/DepartmentsContext';
import { useTickets } from '@/context/TicketsContext';
import {
  EMPTY_TICKET_FORM,
  TICKET_LIMITS,
  hasErrors,
  pickErrors,
  validateTicket,
  type TicketForm,
} from '@/utils/validation';

interface Step {
  title: string;
  subtitle: string;
  fields: readonly (keyof TicketForm)[];
}

const STEPS: readonly Step[] = [
  {
    title: 'Describe el problema',
    subtitle: 'Un título claro y los detalles ayudan a resolverlo más rápido.',
    fields: ['title', 'description'],
  },
  {
    title: 'Clasifícalo',
    subtitle: 'Indica el departamento afectado y qué tan urgente es.',
    fields: ['category', 'priority'],
  },
  {
    title: 'Asígnalo',
    subtitle: 'Quién lo atenderá y, si tienes, una captura del fallo.',
    fields: ['assignee', 'imageUrl'],
  },
  {
    title: 'Revisa y crea',
    subtitle: 'Confirma los datos antes de enviar la solicitud.',
    fields: [],
  },
];

const LAST_STEP = STEPS.length - 1;
// Barra de acciones fija sobre el navbar: el contenido reserva su alto para no quedar tapado.
const ACTIONS_HEIGHT = sizes.button + spacing.xl * 2;

// Avanzar entra desde la derecha y retroceder desde la izquierda: el paso se siente como un recorrido.
const enterForward = FadeInRight.duration(motion.enter);
const enterBackward = FadeInLeft.duration(motion.enter);
const headerEntering = FadeIn.duration(motion.enter);

interface FieldGroupProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FieldGroup({ label, error, children }: FieldGroupProps) {
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
  const scrollRef = useRef<ScrollView>(null);

  const [form, setForm] = useState<TicketForm>(EMPTY_TICKET_FORM);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [attempted, setAttempted] = useState<ReadonlySet<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // El header es negro: mientras esta tab está enfocada la barra de estado va en claro.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const currentStep = STEPS[step] ?? STEPS[0]!;
  const allErrors = validateTicket(form);
  const errors = attempted.has(step) ? pickErrors(allErrors, currentStep.fields) : {};

  const departmentOptions: ChipOption<string>[] = departments.map((department) => ({
    value: department.name,
    label: department.name,
  }));

  const updateField =
    <K extends keyof TicketForm>(key: K) =>
    (value: TicketForm[K]) =>
      setForm((current) => ({ ...current, [key]: value }));

  const goToStep = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const handleNext = () => {
    setAttempted((current) => new Set(current).add(step));

    if (hasErrors(pickErrors(allErrors, currentStep.fields))) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.selectionAsync();
    goToStep(step + 1);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    goToStep(step - 1);
  };

  const resetForm = () => {
    setForm(EMPTY_TICKET_FORM);
    setAttempted(new Set());
    setDirection(1);
    setStep(0);
  };

  const handleCreate = async () => {
    if (hasErrors(allErrors) || !form.priority) {
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
      resetForm();
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

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <>
            <CustomInput
              label="Título del problema"
              placeholder="Ej. La impresora no imprime"
              value={form.title}
              onChangeText={updateField('title')}
              error={errors.title}
              maxLength={TICKET_LIMITS.titleMax}
              autoCapitalize="sentences"
            />
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
          </>
        );
      case 1:
        return (
          <>
            <FieldGroup label="Departamento" error={errors.category}>
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
            </FieldGroup>
            <FieldGroup label="Prioridad" error={errors.priority}>
              <View style={styles.choices}>
                {PRIORITIES.map((priority) => (
                  <ChoiceCard
                    key={priority}
                    title={PRIORITY_META[priority].label}
                    description={PRIORITY_DESCRIPTIONS[priority]}
                    color={PRIORITY_META[priority].color}
                    selected={form.priority === priority}
                    onPress={() => updateField('priority')(priority)}
                  />
                ))}
              </View>
            </FieldGroup>
          </>
        );
      case 2:
        return (
          <>
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
          </>
        );
      default:
        return <TicketReview form={form} onEditStep={goToStep} />;
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
        contentContainerStyle={[styles.content, { paddingBottom: tabBarInset + ACTIONS_HEIGHT }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.headerTop}>
            <Text style={styles.screenTitle}>Nuevo ticket</Text>
            <Text style={styles.stepCounter}>
              Paso {step + 1} de {STEPS.length}
            </Text>
          </View>
          <StepProgress total={STEPS.length} current={step} />
          <Animated.View key={`header-${step}`} entering={headerEntering} style={styles.stepTexts}>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>
          </Animated.View>
        </View>

        <Animated.View
          key={`step-${step}`}
          entering={direction === 1 ? enterForward : enterBackward}
          style={styles.body}>
          {renderStepContent()}
        </Animated.View>
      </ScrollView>

      <View pointerEvents="box-none" style={[styles.actionsBar, { paddingBottom: tabBarInset }]}>
        <LinearGradient
          pointerEvents="none"
          colors={[colors.canvasTransparent, colors.canvas]}
          locations={[0, 0.2]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.actions}>
          {step > 0 && (
            <Button label="Atrás" icon={ArrowLeft} onPress={handleBack} disabled={isSaving} />
          )}
          <View style={styles.primaryAction}>
            {step < LAST_STEP ? (
              <GradientButton label="Siguiente" icon={ArrowRight} onPress={handleNext} />
            ) : (
              <GradientButton
                label="Crear ticket"
                icon={Plus}
                loading={isSaving}
                onPress={handleCreate}
              />
            )}
          </View>
        </View>
      </View>
      <TopInsetCover color={colors.ink} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  screenTitle: {
    ...typography.title,
    color: colors.textOnDark,
  },
  stepCounter: {
    ...typography.caption,
    color: colors.textOnDarkMuted,
    fontVariant: ['tabular-nums'],
  },
  stepTexts: {
    gap: spacing.xxs,
  },
  stepTitle: {
    ...typography.heading,
    color: colors.textOnDark,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.textOnDarkMuted,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
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
  choices: {
    gap: spacing.sm,
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
  actionsBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  primaryAction: {
    flex: 1,
  },
});
