import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colors, gradientDirection, radii, sizes, spacing, typography } from '@/constants/theme';

import { PressableScale } from './PressableScale';

interface StatCardProps {
  value: number;
  label: string;
  gradient: readonly [string, string, ...string[]];
  active: boolean;
  onPress: () => void;
}

const ACTION_SIZE = 40;

// Funciona como filtro rápido: activo muestra una X para indicar que tocarlo de nuevo lo quita.
export function StatCard({ value, label, gradient, active, onPress }: StatCardProps) {
  const ActionIcon = active ? X : ArrowRight;

  // El Pressable no se estira solo dentro de una fila: el contenedor externo reparte el ancho.
  return (
    <View style={styles.wrapper}>
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${value} ${label}${active ? ', filtro activo' : ''}`}
        accessibilitySelected={active}>
        <LinearGradient
          colors={gradient}
          start={gradientDirection.start}
          end={gradientDirection.end}
          style={[styles.card, active && styles.cardActive]}>
          <View style={styles.texts}>
            <Text style={styles.value}>{String(value).padStart(2, '0')}</Text>
            <Text style={styles.label} numberOfLines={1}>
              {label}
            </Text>
          </View>
          <View style={styles.action}>
            <ActionIcon color={colors.textOnDark} size={sizes.iconSmall + 2} strokeWidth={2} />
          </View>
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: {
    borderColor: colors.ink,
  },
  texts: {
    flexShrink: 1,
  },
  value: {
    ...typography.display,
    color: colors.textOnDark,
    fontVariant: ['tabular-nums'],
  },
  label: {
    ...typography.label,
    color: colors.textOnDark,
  },
  action: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
