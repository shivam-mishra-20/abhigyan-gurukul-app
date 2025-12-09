import { Dimensions, Image, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SlideData } from "./data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SlideProps {
  item: SlideData;
  index: number;
  scrollX: SharedValue<number>;
}

export default function Slide({ item, index, scrollX }: SlideProps) {
  const animatedImageStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.6, 1, 0.6],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [50, 0, 50],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SCREEN_WIDTH,
      index * SCREEN_WIDTH,
      (index + 1) * SCREEN_WIDTH,
    ];

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, 30],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Skip rendering if this is a login slide (should not happen, but safety check)
  if (item.type === "login") {
    return null;
  }

  return (
    <View
      className="flex-1 items-center justify-center px-8"
      style={{ width: SCREEN_WIDTH }}
    >
      {/* Decorative circles */}
      <View className="absolute top-8 left-4 w-12 h-12 rounded-full bg-blue-500 opacity-70" />
      <View
        className="absolute top-4 right-0 w-32 h-32 rounded-full bg-yellow-400"
        style={{ right: -40 }}
      />
      <View className="absolute bottom-40 left-4 w-4 h-4 rounded-full bg-red-400 opacity-70" />
      <View className="absolute bottom-60 right-8 w-5 h-5 rounded-full bg-yellow-400" />

      {/* Logo without circular border */}
      {item.image && (
        <Animated.View
          style={animatedImageStyle}
          className="items-center justify-center mb-12"
        >
          <Image
            source={item.image}
            className="w-56 h-56"
            resizeMode="contain"
          />
        </Animated.View>
      )}

      {/* Text Content */}
      <Animated.View style={animatedTextStyle} className="items-center">
        {item.title && (
          <Text className="text-3xl font-bold text-gray-800 text-center mb-4 leading-10">
            {item.title}
          </Text>
        )}
        {item.subtitle && (
          <Text className="text-base text-gray-500 text-center px-4 leading-6">
            {item.subtitle}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
