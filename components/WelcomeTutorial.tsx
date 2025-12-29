import { completeWelcomeTutorial } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Abhigyan Gurukul brand colors
const THEME = {
  primary: "#f97316", // Orange
  primaryDark: "#ea580c",
  accent: "#1e40af", // Blue
  accentLight: "#3b82f6",
};

interface TutorialSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

const SLIDES: TutorialSlide[] = [
  {
    id: "1",
    icon: "book",
    iconColor: THEME.primary,
    iconBg: "#fff7ed",
    title: "Learn at Your Pace",
    description: "Access video lectures, study materials, and courses tailored to your class and target exams.",
  },
  {
    id: "2",
    icon: "play-circle",
    iconColor: THEME.accent,
    iconBg: "#eff6ff",
    title: "Video Learning",
    description: "Watch lessons with playback controls, bookmark important moments, and resume where you left off.",
  },
  {
    id: "3",
    icon: "document-text",
    iconColor: "#7c3aed",
    iconBg: "#ede9fe",
    title: "Practice & Test",
    description: "Take online exams, track your results, and see your performance on the leaderboard.",
  },
  {
    id: "4",
    icon: "stats-chart",
    iconColor: THEME.primary,
    iconBg: "#fff7ed",
    title: "Track Progress",
    description: "Monitor your study time, course completion, and exam scores all in one place.",
  },
];

interface WelcomeTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

export default function WelcomeTutorial({ visible, onComplete }: WelcomeTutorialProps) {
  const flatListRef = useRef<FlatList<TutorialSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleComplete();
    }
  };
  
  const handleSkip = () => {
    handleComplete();
  };
  
  const handleComplete = async () => {
    try {
      await completeWelcomeTutorial().catch(() => {});
    } finally {
      onComplete();
    }
  };
  
  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }, []);
  
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;
  
  const renderSlide = ({ item }: { item: TutorialSlide }) => {
    return (
      <View style={{ width: SCREEN_WIDTH }} className="flex-1 items-center justify-center px-8">
        <View 
          className="w-32 h-32 rounded-full items-center justify-center mb-8"
          style={{ backgroundColor: item.iconBg }}
        >
          <Ionicons name={item.icon} size={64} color={item.iconColor} />
        </View>
        <Text className="text-gray-900 text-2xl font-bold text-center mb-4">
          {item.title}
        </Text>
        <Text className="text-gray-600 text-center text-base leading-6">
          {item.description}
        </Text>
      </View>
    );
  };
  
  // Dot indicator
  const renderDot = (index: number) => (
    <View
      key={index}
      className="h-2 rounded-full mx-1"
      style={{
        width: currentIndex === index ? 24 : 8,
        backgroundColor: currentIndex === index ? THEME.primary : "#d1d5db",
        opacity: currentIndex === index ? 1 : 0.5,
      }}
    />
  );
  
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-white">
        {/* Skip Button */}
        <View className="absolute top-14 right-6 z-10">
          <Pressable onPress={handleSkip} className="py-2 px-4">
            <Text style={{ color: THEME.primary }} className="font-medium">Skip</Text>
          </Pressable>
        </View>
        
        {/* Content */}
        <View className="flex-1 justify-center">
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderSlide}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
          />
        </View>
        
        {/* Bottom Section */}
        <View className="px-6 pb-12">
          {/* Dots */}
          <View className="flex-row justify-center mb-8">
            {SLIDES.map((_, index) => renderDot(index))}
          </View>
          
          {/* Button */}
          <Pressable
            onPress={handleNext}
            className="py-4 rounded-2xl items-center"
            style={{ backgroundColor: THEME.primary }}
          >
            <Text className="text-white font-bold text-lg">
              {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
