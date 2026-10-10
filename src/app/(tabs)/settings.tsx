import * as Haptics from 'expo-haptics';
import { RotateCcw, Save, Wifi } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { CustomInput } from '@/components/CustomInput';
import { DepartmentList } from '@/components/DepartmentList';
import { useTabBarInset } from '@/components/FloatingNav';
import { TopInsetCover } from '@/components/TopInsetCover';
import { DEFAULT_BASE_URL } from '@/constants/config';
import { colors, motion, radii, spacing, typography } from '@/constants/theme';
import { useNavActions } from '@/context/NavActionsContext';
import { useTickets } from '@/context/TicketsContext';
import { useLightStatusBar } from '@/hooks/useLightStatusBar';
import { isValidHttpsUrl } from '@/utils/validation';

type TestResult = { ok: true; count: number } | { ok: false; message: string };

const DOT_SIZE = 8;
const resultEntering = FadeIn.duration(motion.crossfade);

interface SectionProps {
  title: string;
  caption?: string;
  children: ReactNode;
}

function Section({ title, caption, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {caption && <Text style={styles.sectionCaption}>{caption}</Text>}
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { baseUrl, changeBaseUrl, testConnection } = useTickets();

  const [urlDraft, setUrlDraft] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useLightStatusBar();

  const urlValue = urlDraft ?? baseUrl;
  const urlError =
    urlDraft !== null && !isValidHttpsUrl(urlDraft)
      ? 'Ingresa una URL válida que empiece con https://'
      : undefined;
  const canSave =
    urlDraft !== null && urlError === undefined && urlDraft.trim().replace(/\/+$/, '') !== baseUrl;
  const isDefault = baseUrl === DEFAULT_BASE_URL.replace(/\/+$/, '');

  const handleTest = async () => {
    if (urlError) {
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const count = await testConnection(urlValue);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTestResult({ ok: true, count });
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTestResult({
        ok: false,
        message: error instanceof Error ? error.message : 'No se pudo conectar.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const applyUrl = async (url: string) => {
    setIsSaving(true);
    try {
      await changeBaseUrl(url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUrlDraft(null);
      setTestResult(null);
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar de servidor descarta la caché local: se confirma porque los datos guardados se pierden.
  const confirmChange = (url: string, title: string) => {
    Alert.alert(title, 'Se descartarán los tickets guardados y se cargarán desde la nueva URL.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Continuar', onPress: () => applyUrl(url) },
    ]);
  };

  useNavActions({
    primary: canSave
      ? {
          label: 'Guardar URL',
          icon: Save,
          loading: isSaving,
          onPress: () => confirmChange(urlValue, 'Cambiar URL'),
        }
      : undefined,
  });

  return (
    <View style={styles.screen}>
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarInset }}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.subtitle}>Conexión con el servidor y catálogo de departamentos.</Text>
        </View>

        <View style={styles.body}>
          <Section title="Servidor (MockAPI)" caption={isDefault ? 'Por defecto' : 'Personalizada'}>
            <View style={styles.card}>
              <CustomInput
                label="URL base de la API"
                hideLabel
                tone="muted"
                value={urlValue}
                onChangeText={(value) => {
                  setUrlDraft(value);
                  setTestResult(null);
                }}
                error={urlError}
                hint={canSave ? 'Pulsa "Guardar URL" para aplicarla.' : 'Sin "/tickets" al final.'}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />

              {(isTesting || testResult) && (
                <Animated.View
                  key={isTesting ? 'testing' : 'result'}
                  entering={resultEntering}
                  style={styles.result}>
                  {isTesting ? (
                    <>
                      <ActivityIndicator size="small" color={colors.textSecondary} />
                      <Text style={styles.resultText}>Probando conexión…</Text>
                    </>
                  ) : (
                    testResult && (
                      <>
                        <View
                          style={[
                            styles.dot,
                            { backgroundColor: testResult.ok ? colors.green : colors.red },
                          ]}
                        />
                        <Text style={styles.resultText}>
                          {testResult.ok
                            ? `Conexión exitosa · ${testResult.count} tickets disponibles`
                            : testResult.message}
                        </Text>
                      </>
                    )
                  )}
                </Animated.View>
              )}

              <View style={styles.actions}>
                <View style={styles.action}>
                  <Button
                    label="Probar"
                    icon={Wifi}
                    onPress={handleTest}
                    disabled={isTesting || urlError !== undefined}
                  />
                </View>
                <View style={styles.action}>
                  <Button
                    label="Restaurar"
                    icon={RotateCcw}
                    variant="outline"
                    onPress={() => confirmChange(DEFAULT_BASE_URL, 'Restaurar URL por defecto')}
                    disabled={isDefault || isSaving}
                  />
                </View>
              </View>
            </View>
          </Section>

          <Section title="Departamentos" caption="Guardados en el dispositivo">
            <DepartmentList />
          </Section>
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
  header: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.gutter,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    gap: spacing.xxs,
  },
  title: {
    ...typography.title,
    color: colors.textOnDark,
  },
  subtitle: {
    ...typography.body,
    color: colors.textOnDarkMuted,
  },
  body: {
    paddingHorizontal: spacing.gutter,
    paddingTop: spacing.xl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginHorizontal: spacing.xxs,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionCaption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.xxs,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: radii.pill,
  },
  resultText: {
    ...typography.caption,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
