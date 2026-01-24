import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 85 : 70;
const CURVE_HEIGHT = 0;
const ACTIVE_CIRCLE_SIZE = 56;

interface AnimatedTabBarProps extends BottomTabBarProps {
  activeTintColor?: string;
  inactiveTintColor?: string;
  backgroundColor?: string;
  isDark?: boolean;
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  activeTintColor = "#4F46E5", // Indigo as default
  inactiveTintColor = "#6B7280",
  backgroundColor = "#FFFFFF",
}: AnimatedTabBarProps) {
  // Use reactive window dimensions to handle orientation changes (fullscreen mode)
  const { width } = useWindowDimensions();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  // @ts-ignore
  const shouldHide = focusedOptions.tabBarStyle?.display === "none";

  const visibleRoutes = useMemo(() => {
    return state.routes.filter((route) => {
      const { options } = descriptors[route.key];

      const hiddenRoutes = [
        "reviews",
        "batches",
        "students",
        "performance",
        "announcements",
        "student-report",
        "settings",
        "build-exam",
        "notifications",
        "results",
        "progress",
        "attendance",
        "materials",
        "schedule",
        "leaderboard",
        "modules",
        "profile",
        "attempt/[attemptId]",
        "result/[attemptId]",
        "course/[courseId]",
        "video/[lectureId]",
      ];

      if (hiddenRoutes.includes(route.name)) {
        return false;
      }

      // @ts-ignore - href exists in Expo Router but not in base type
      const href = options.href;
      return href !== null;
    });
  }, [state.routes, descriptors]);

  const visibleRoutesCount = visibleRoutes.length;
  const tabWidth = width / visibleRoutesCount;

  const animatedIndex = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const currentIndex = visibleRoutes.findIndex(
      (route) => route.key === state.routes[state.index].key,
    );

    if (currentIndex === -1) return;

    // Animate the curve position
    Animated.spring(animatedIndex, {
      toValue: currentIndex,
      useNativeDriver: false,
      tension: 68,
      friction: 12,
    }).start();
  }, [state.index, state.routes, visibleRoutes, animatedIndex]);

  // Generate SVG path for the curved tab bar (downward curve/notch)
  const generatePath = useCallback(
    (activeIndex: number) => {
      const curveWidth = 70;
      const centerX = activeIndex * tabWidth + tabWidth / 2;
      const startX = centerX - curveWidth / 2;
      const endX = centerX + curveWidth / 2;
      const curveDepth = 40;

      return `
      M 0 0
      L ${startX - 10} 0
      C ${startX + 5} 0, ${startX + 10} ${curveDepth}, ${centerX} ${curveDepth}
      C ${endX - 10} ${curveDepth}, ${endX - 5} 0, ${endX + 10} 0
      L ${width} 0
      L ${width} ${TAB_BAR_HEIGHT}
      L 0 ${TAB_BAR_HEIGHT}
      Z
    `;
    },
    [tabWidth, width],
  );

  const [pathD, setPathD] = React.useState(() => {
    const currentIndex = visibleRoutes.findIndex(
      (route) => route.key === state.routes[state.index].key,
    );
    const curveWidth = 70;
    const centerX = Math.max(0, currentIndex) * tabWidth + tabWidth / 2;
    const startX = centerX - curveWidth / 2;
    const endX = centerX + curveWidth / 2;
    const curveDepth = 40;
    return `
      M 0 0
      L ${startX - 10} 0
      C ${startX + 5} 0, ${startX + 10} ${curveDepth}, ${centerX} ${curveDepth}
      C ${endX - 10} ${curveDepth}, ${endX - 5} 0, ${endX + 10} 0
      L ${width} 0
      L ${width} ${TAB_BAR_HEIGHT}
      L 0 ${TAB_BAR_HEIGHT}
      Z
    `;
  });

  useEffect(() => {
    const listenerId = animatedIndex.addListener(({ value }) => {
      setPathD(generatePath(value));
    });

    return () => {
      animatedIndex.removeListener(listenerId);
    };
  }, [animatedIndex, generatePath]);

  // Calculate active circle position
  const activeCircleTranslateX = animatedIndex.interpolate({
    inputRange: visibleRoutes.map((_, i) => i),
    outputRange: visibleRoutes.map(
      (_, i) => i * tabWidth + tabWidth / 2 - ACTIVE_CIRCLE_SIZE / 2,
    ),
  });

  if (shouldHide) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      {/* SVG Curved Background */}
      <Svg width={width} height={TAB_BAR_HEIGHT} style={styles.svgContainer}>
        <Path d={pathD} fill={backgroundColor} />
      </Svg>

      {/* Floating Active Circle - positioned in the curve notch */}
      <Animated.View
        style={[
          styles.activeCircle,
          {
            backgroundColor: activeTintColor,
            transform: [{ translateX: activeCircleTranslateX }],
          },
        ]}
      >
        {/* Render active icon inside the circle */}
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);
          if (!isFocused) return null;
          return (
            <View key={route.key}>
              {options.tabBarIcon?.({
                focused: true,
                color: "#FFFFFF",
                size: 24,
              })}
            </View>
          );
        })}
      </Animated.View>

      {/* Tab Items */}
      <View style={styles.tabContainer}>
        {visibleRoutes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            // If already focused, do nothing - prevents refresh and navigation reset
            if (isFocused) {
              return;
            }

            if (!event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
              activeOpacity={0.7}
            >
              {!isFocused && (
                <View style={styles.tabContent}>
                  <View style={styles.iconWrapper}>
                    {options.tabBarIcon?.({
                      focused: false,
                      color: inactiveTintColor,
                      size: 22,
                    })}
                  </View>
                  <Text
                    style={[styles.label, { color: inactiveTintColor }]}
                    numberOfLines={1}
                  >
                    {options.title}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    height: TAB_BAR_HEIGHT + CURVE_HEIGHT,
  },
  svgContainer: {
    position: "absolute",
    top: CURVE_HEIGHT,
    left: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 12,
    borderTopWidth: 0,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  activeCircle: {
    position: "absolute",
    top: CURVE_HEIGHT - ACTIVE_CIRCLE_SIZE / 2 + 16,
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    borderRadius: ACTIVE_CIRCLE_SIZE,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    position: "absolute",
    top: CURVE_HEIGHT,
    left: 0,
    right: 0,
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    textAlign: "center",
  },
});
