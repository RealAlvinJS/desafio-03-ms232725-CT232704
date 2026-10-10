import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
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
} from '@/constants/theme';

import { PressableScale } from './PressableScale';

const ITEM_STEP = sizes.navItem + navbar.gap;
const TAB_BAR_HEIGHT = sizes.navItem + navbar.padding * 2;
const indicatorEasing = Easing.bezier(...motion.easeInOut);

// Espacio que cada pantalla debe reservar abajo para que el navbar flotante no tape contenido.
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + navbar.bottomOffset + TAB_BAR_HEIGHT + navbar.bottomOffset;
}

// Las tabs son pares: solo se desliza el indicador, el contenido cambia sin animación.
export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const indicatorX = useSharedValue(state.index * ITEM_STEP);

  useEffect(() => {
    const target = state.index * ITEM_STEP;
    indicatorX.set(
      reduceMotion
        ? target
        : withTiming(target, { duration: motion.indicator, easing: indicatorEasing }),
    );
  }, [state.index, reduceMotion, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.get() }],
  }));

  // Sobre la zona negra del listado el contenedor se aclara un tono para no desaparecer.
  const isOverDarkZone = state.routes[state.index]?.name === 'index';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, { bottom: insets.bottom + navbar.bottomOffset }]}>
      <View
        style={[styles.container, isOverDarkZone ? styles.containerDark : styles.containerLight]}>
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          <LinearGradient
            colors={gradients.brand}
            start={gradientDirection.start}
            end={gradientDirection.end}
            style={styles.indicatorRing}
          />
          <View style={styles.indicatorCore} />
        </Animated.View>

        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) {
            return null;
          }

          const { options } = descriptor;
          const isFocused = state.index === index;
          const color = isFocused ? colors.textOnDark : colors.textOnDarkMuted;

          const handlePress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              Haptics.selectionAsync();
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <PressableScale
              key={route.key}
              onPress={handlePress}
              accessibilityRole="tab"
              accessibilityLabel={options.title ?? route.name}
              accessibilitySelected={isFocused}
              style={[styles.item, !isFocused && styles.itemIdle]}>
              {options.tabBarIcon?.({ focused: isFocused, color, size: sizes.icon })}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    gap: navbar.gap,
    padding: navbar.padding,
    borderRadius: radii.pill,
    ...shadows.navbar,
  },
  containerDark: {
    backgroundColor: colors.ink2,
    borderWidth: 1,
    borderColor: colors.ink3,
  },
  containerLight: {
    backgroundColor: colors.navbarOverlay,
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
