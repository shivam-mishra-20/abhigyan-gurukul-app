import { getToken, getUser } from "@/lib/auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export default function SplashScreen() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const navigateBasedOnAuth = async () => {
    try {
      const token = await getToken();
      const user = await getUser();

      if (token && user) {
        // User is logged in, navigate to role-specific home
        switch (user.role) {
          case "student":
            router.replace("/(student)/" as any);
            break;
          case "teacher":
            router.replace("/(teacher)/" as any);
            break;
          case "admin":
            router.replace("/(teacher)/" as any); // Admin uses teacher interface
            break;
          default:
            // Unknown role, show onboarding
            router.replace("/onboarding");
        }
      } else {
        // No auth, show onboarding
        router.replace("/onboarding");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/onboarding");
    }
  };

  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Fade-in animation
    opacity.value = withSequence(
      // Fade in
      withTiming(1, {
        duration: 600,
        easing: Easing.out(Easing.cubic),
      }),
      // Hold visible
      withDelay(800, withTiming(1, { duration: 1 })),
      // Fade out
      withTiming(0, {
        duration: 1000,
        easing: Easing.in(Easing.cubic),
      })
    );

    // Zoom-out sequence
    scale.value = withSequence(
      // Hold at normal size
      withDelay(1400, withTiming(1, { duration: 1 })),
      // Zoom out
      withTiming(
        3.5,
        {
          duration: 1200,
          easing: Easing.in(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(navigateBasedOnAuth)();
          }
        }
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = opacity.value * 0.25;
    return {
      shadowColor: "#FF6B35",
      shadowOffset: {
        width: 0,
        height: 15,
      },
      shadowOpacity: shadowOpacity,
      shadowRadius: 25,
      elevation: 15,
    };
  });

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Animated Logo */}
      <Animated.View
        style={[
          {
            alignItems: "center",
            justifyContent: "center",
          },
          animatedStyle,
          shadowStyle,
        ]}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 280,
            height: 280,
            borderRadius: 140,
          }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
