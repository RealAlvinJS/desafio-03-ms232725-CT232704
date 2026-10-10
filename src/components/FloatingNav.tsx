import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, usePathname } from 'expo-router';
import { ArrowLeft, Plus, Settings, Ticket, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  FadeInLeft,
  FadeInRight,
  FadeOutLeft,
  FadeOutRight,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  colors,
  gradientDirection,
  gradients,
  motion,
  navbar,
  radii,
  shadows,
  sizes,
  spacing,
} from '@/constants/theme';
import { useNavActionsState, type NavAction } from '@/context/NavActionsContext';

import { GradientButton } from './GradientButton';
import { PressableScale } from './PressableScale';

interface TabItem {
  href: '/' | '/create' | '/settings';
  label: string;
  icon: LucideIcon;
}

const TABS: readonly TabItem[] = [
  { href: '/', label: 'Tickets', icon: Ticket },
  { href: '/create', label: 'Nuevo ticket', icon: Plus },
  { href: '/settings', label: 'Ajustes', icon: Settings },
];

const ITEM_STEP = sizes.navItem + navbar.gap;
export const ISLAND_HEIGHT = sizes.navItem + navbar.padding * 2;
const ISLAND_WIDTH =
  TABS.length * sizes.navItem + (TABS.length - 1) * navbar.gap + navbar.padding * 2;
const BACK_SLOT = ISLAND_HEIGHT + navbar.gap;
const indicatorEasing = Easing.bezier(...motion.easeInOut);

// Las extensiones salen "desde" la isla: atrás se desliza hacia la izquierda y la acción hacia la derecha.
const backEntering = FadeInRight.duration(motion.enter);
const backExiting = FadeOutRight.duration(motion.chip);
const primaryEntering = FadeInLeft.duration(motion.enter);
const primaryExiting = FadeOutLeft.duration(motion.chip);

// La isla se centra con sus extensiones: con acción principal se ancla a la izquierda para dejarle espacio.
function islandLeftFor(width: number, hasBack: boolean, hasPrimary: boolean): number {
  if (hasPrimary) {
    return hasBack ? BACK_SLOT : 0;
  }
  const groupWidth = ISLAND_WIDTH + (hasBack ? BACK_SLOT : 0);
  return (width - groupWidth) / 2 + (hasBack ? BACK_SLOT : 0);
}

function useNavBottom(): number {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom - navbar.homeIndicatorOverlap, spacing.sm);
}

// Espacio que cada pantalla debe reservar abajo para que la isla no tape contenido.
export function useTabBarInset(): number {
  return useNavBottom() + ISLAND_HEIGHT + spacing.md;
}

export function FloatingNav() {
  const bottom = useNavBottom();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const actions = useNavActionsState();

  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);
  const indicatorX = useSharedValue(Math.max(activeIndex, 0) * ITEM_STEP);
  const indicatorOpacity = useSharedValue(activeIndex >= 0 ? 1 : 0);

  useEffect(() => {
    indicatorOpacity.set(withTiming(activeIndex >= 0 ? 1 : 0, { duration: motion.chip }));
    if (activeIndex < 0) {
      return;
    }
    const target = activeIndex * ITEM_STEP;
    indicatorX.set(
      reduceMotion
        ? target
        : withTiming(target, { duration: motion.indicator, easing: indicatorEasing }),
    );
  }, [activeIndex, reduceMotion, indicatorX, indicatorOpacity]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.get(),
    transform: [{ translateX: indicatorX.get() }],
  }));

  // Fuera de las tabs (rutas apiladas) atrás aparece solo, salvo que la pantalla defina el suyo.
  const isStackedRoute = activeIndex < 0 && router.canGoBack();
  const back: NavAction | undefined =
    actions.back ??
    (isStackedRoute ? { label: 'Volver', onPress: () => router.back() } : undefined);
  const primary = actions.primary;

  const isOverDarkZone = pathname === '/';

  const [rowWidth, setRowWidth] = useState(0);
  const islandLeft = useSharedValue(0);
  const targetLeft = islandLeftFor(rowWidth, back !== undefined, primary !== undefined);

  useEffect(() => {
    islandLeft.set(
      reduceMotion || rowWidth === 0
        ? targetLeft
        : withTiming(targetLeft, { duration: motion.indicator, easing: indicatorEasing }),
    );
  }, [targetLeft, rowWidth, reduceMotion, islandLeft]);

  const islandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: islandLeft.get() }],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: islandLeft.get() - BACK_SLOT }],
  }));
  // La acción ocupa todo lo que queda a la derecha de la isla.
  const primaryStyle = useAnimatedStyle(() => {
    const left = islandLeft.get() + ISLAND_WIDTH + navbar.gap;
    return { left, width: Math.max(rowWidth - left, 0) };
  });

  const handleRowLayout = (event: LayoutChangeEvent) => setRowWidth(event.nativeEvent.layout.width);

  const handleTabPress = (tab: TabItem, index: number) => {
    if (index === activeIndex) {
      return;
    }
    Haptics.selectionAsync();
    router.navigate(tab.href);
  };

  const handleBack = () => {
    Haptics.selectionAsync();
    back?.onPress();
  };

  return (
    <View pointerEvents="box-none" onLayout={handleRowLayout} style={[styles.wrapper, { bottom }]}>
      {back && (
        <Animated.View
          key="back"
          entering={backEntering}
          exiting={backExiting}
          style={[styles.slot, backStyle]}>
          <PressableScale
            onPress={handleBack}
            accessibilityLabel={back.label}
            style={styles.backButton}>
            <ArrowLeft color={colors.textOnDark} size={sizes.icon} strokeWidth={sizes.iconStroke} />
          </PressableScale>
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.slot,
          styles.island,
          isOverDarkZone ? styles.surfaceDark : styles.surfaceLight,
          islandStyle,
        ]}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          <LinearGradient
            colors={gradients.brand}
            start={gradientDirection.start}
            end={gradientDirection.end}
            style={styles.indicatorRing}
          />
          <View style={styles.indicatorCore} />
        </Animated.View>

        {TABS.map((tab, index) => {
          const isFocused = index === activeIndex;
          const Icon = tab.icon;
          return (
            <PressableScale
              key={tab.href}
              onPress={() => handleTabPress(tab, index)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilitySelected={isFocused}
              style={[styles.item, !isFocused && styles.itemIdle]}>
              <Icon
                color={isFocused ? colors.textOnDark : colors.textOnDarkMuted}
                size={sizes.icon}
                strokeWidth={sizes.iconStroke}
              />
            </PressableScale>
          );
        })}
      </Animated.View>

      {primary && (
        <Animated.View
          key="primary"
          entering={primaryEntering}
          exiting={primaryExiting}
          style={[styles.slot, styles.primarySlot, primaryStyle]}>
          <GradientButton
            label={primary.label}
            icon={primary.icon}
            loading={primary.loading}
            onPress={primary.onPress}
            height={ISLAND_HEIGHT}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    height: ISLAND_HEIGHT,
  },
  slot: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  island: {
    flexDirection: 'row',
    gap: navbar.gap,
    padding: navbar.padding,
    borderRadius: radii.pill,
    ...shadows.navbar,
  },
  surfaceDark: {
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.ink3,
  },
  surfaceLight: {
    backgroundColor: colors.navbarOverlay,
  },
  backButton: {
    width: ISLAND_HEIGHT,
    height: ISLAND_HEIGHT,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
    borderWidth: 1,
    borderColor: colors.ink3,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.navbar,
  },
  primarySlot: {
    borderRadius: radii.pill,
    ...shadows.navbar,
  },
  indicator: {
    position: 'absolute',
    top: navbar.padding,
    left: navbar.padding,
    width: sizes.navItem,
    height: sizes.navItem,
  },
  indicatorRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.pill,
  },
  indicatorCore: {
    position: 'absolute',
    top: navbar.ringWidth,
    left: navbar.ringWidth,
    right: navbar.ringWidth,
    bottom: navbar.ringWidth,
    borderRadius: radii.pill,
    backgroundColor: colors.ink,
  },
  item: {
    width: sizes.navItem,
    height: sizes.navItem,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIdle: {
    backgroundColor: colors.ink3,
  },
});
