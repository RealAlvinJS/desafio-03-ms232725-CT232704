import { LinearGradient } from 'expo-linear-gradient';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import {
  colors,
  gradientDirection,
  gradients,
  motion,
  radii,
  sizes,
  spacing,
  typography,
} from '@/constants/theme';

import { PressableScale } from './PressableScale';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  height?: number;
}

// La capa de gradiente mide el triple del botón y se desplaza: solo transform, sin costo de layout.
const GRADIENT_SCALE = 3;
const ICON_MIN_WIDTH = 150;

export function GradientButton({
  label,
  onPress,
  icon: Icon,
  loading = false,
  disabled = false,
  height = sizes.button,
}: GradientButtonProps) {
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (width === 0) {
      return;
    }

    // Sin movimiento se fija el tramo central, donde dominan morado y magenta.
    if (reduceMotion) {
      translateX.set((-width * (GRADIENT_SCALE - 1)) / 2);
      return;
    }

    // Mientras guarda, el gradiente acelera para comunicar que hay trabajo en curso.
    const duration = loading ? motion.gradientLoopLoading : motion.gradientLoop;
    translateX.set(0);
    translateX.set(
      withRepeat(
        withTiming(-width * (GRADIENT_SCALE - 1), { duration, easing: Easing.linear }),
        -1,
        true,
      ),
    );

    return () => cancelAnimation(translateX);
  }, [width, loading, reduceMotion, translateX]);

  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }],
  }));

  // En espacios angostos (como la isla con atrás) se prioriza el texto sobre el ícono.
  const showIcon = Icon !== undefined && (width === 0 || width >= ICON_MIN_WIDTH);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const isInactive = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isInactive}
      accessibilityLabel={label}
      style={[styles.button, { height }, disabled && styles.disabled]}>
      <View style={StyleSheet.absoluteFill} onLayout={handleLayout}>
        <Animated.View
          style={[styles.gradientLayer, { width: width * GRADIENT_SCALE }, gradientStyle]}>
          <LinearGradient
            colors={gradients.brand}
            start={gradientDirection.start}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.textOnDark} />
      ) : (
        <View style={styles.content}>
          {showIcon && Icon && (
            <Icon color={colors.textOnDark} size={sizes.icon} strokeWidth={sizes.iconStroke} />
          )}
          <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purple,
  },
  disabled: {
    opacity: 0.5,
  },
  gradientLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  content: {
    flexShrink: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.textOnDark,
  },
});
