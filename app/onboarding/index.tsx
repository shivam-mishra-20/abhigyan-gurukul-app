import { SlideData, slides } from "@/constants/onboardingData";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Pressable,
    Text,
    View,
    ViewToken,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import LoginSlide from "./LoginSlide";
import RegisterSlide from "./RegisterSlide";
import Slide from "./Slide";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<SlideData>);

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRegister, setShowRegister] = useState(false);
  const scrollX = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleSkip = () => {
    // Skip navigates to general/guest user flow
    router.replace("/(guest)/" as any);
  };

  const handleLoginSuccess = (role: string) => {
    // Navigate based on user role
    switch (role) {
      case "student":
        router.replace("/(student)/" as any);
        break;
      case "teacher":
      case "admin":
        router.replace("/(teacher)/" as any);
        break;
      default:
        router.replace("/(guest)/" as any);
    }
  };

  const handleRegister = () => {
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setShowRegister(false);
  };

  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    // Optionally scroll back to login
    flatListRef.current?.scrollToIndex({ index: 1 });
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Navigate to guest on completion
      router.replace("/(guest)/" as any);
    }
  };

  // Dot indicator component
  const DotIndicator = ({ index }: { index: number }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * SCREEN_WIDTH,
        index * SCREEN_WIDTH,
        (index + 1) * SCREEN_WIDTH,
      ];

      const width = interpolate(
        scrollX.value,
        inputRange,
        [8, 24, 8],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        scrollX.value,
        inputRange,
        [0.4, 1, 0.4],
        Extrapolation.CLAMP
      );

      return {
        width,
        opacity,
      };
    });

    return (
      <Animated.View
        style={animatedDotStyle}
        className="h-2 rounded-full bg-green-500 mx-1"
      />
    );
  };

  // Animated button style
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handlePressIn = () => {
    buttonScale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    buttonScale.value = withTiming(1, { duration: 100 });
  };

  return (
    <View className="flex-1 bg-white">
      {showRegister ? (
        <RegisterSlide
          onBack={handleBackToLogin}
          onRegistrationSuccess={handleRegistrationSuccess}
        />
      ) : (
        <>
          {/* Skip button */}
          <View className="absolute top-14 right-6 z-10">
            <Pressable onPress={handleSkip} className="py-2 px-4">
              <Text className="text-gray-600 text-base font-medium">Skip</Text>
            </Pressable>
          </View>

          {/* Slides */}
          <AnimatedFlatList
            ref={flatListRef}
            data={slides}
            renderItem={({ item, index }) =>
              item.type === "login" ? (
                <LoginSlide
                  onLoginSuccess={handleLoginSuccess}
                  onSkip={handleSkip}
                  onRegister={handleRegister}
                />
              ) : (
                <Slide item={item} index={index} scrollX={scrollX} />
              )
            }
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            className="flex-1"
          />

          {/* Bottom section - Only show for non-login slides */}
          {currentIndex === 0 && (
            <View className="pb-12 px-6">
              {/* Dot indicators */}
              <View className="flex-row justify-center items-center mb-8">
                {slides.map((_, index) => (
                  <DotIndicator key={index} index={index} />
                ))}
              </View>

              {/* Continue button */}
              <Animated.View style={animatedButtonStyle}>
                <Pressable
                  onPress={handleNext}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  className="bg-green-600 rounded-xl py-4 px-8 flex-row items-center justify-center shadow-lg"
                  style={{
                    shadowColor: "#059669",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                >
                  <Text className="text-white text-lg font-bold mr-2">
                    Continue
                  </Text>
                  <Ionicons name="arrow-forward" size={22} color="white" />
                </Pressable>
              </Animated.View>
            </View>
          )}
        </>
      )}
    </View>
  );
}
