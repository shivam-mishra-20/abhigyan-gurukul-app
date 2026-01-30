import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  BookOpen,
  GraduationCap,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GuestHome() {
  const router = useRouter();

  const features = [
    {
      icon: BookOpen,
      title: "Live Classes",
      description: "Interactive sessions with expert teachers",
      color: "#3B82F6",
      bgColor: "#DBEAFE",
    },
    {
      icon: Target,
      title: "Practice Tests",
      description: "CBT exams to test your knowledge",
      color: "#8B5CF6",
      bgColor: "#EDE9FE",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Detailed performance analytics",
      color: "#10B981",
      bgColor: "#D1FAE5",
    },
    {
      icon: MessageCircle,
      title: "Doubt Clearing",
      description: "Ask questions anytime",
      color: "#F59E0B",
      bgColor: "#FEF3C7",
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Learn from experienced educators",
      color: "#EC4899",
      bgColor: "#FCE7F3",
    },
    {
      icon: GraduationCap,
      title: "Flexible Learning",
      description: "Study at your own pace 24/7",
      color: "#06B6D4",
      bgColor: "#CFFAFE",
    },
  ];

  const courses = [
    {
      title: "JEE Preparation",
      subtitle: "Main & Advanced",
      icon: "rocket",
      color: "#8B5CF6",
      students: "500+",
    },
    {
      title: "NEET Coaching",
      subtitle: "Medical Entrance",
      icon: "medkit",
      color: "#EC4899",
      students: "350+",
    },
    {
      title: "Class 7-12",
      subtitle: "CBSE & State Board",
      icon: "book",
      color: "#3B82F6",
      students: "800+",
    },
    {
      title: "Foundation",
      subtitle: "Build Strong Basics",
      icon: "construct",
      color: "#10B981",
      students: "400+",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={["#059669", "#10B981", "#34D399"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="pt-16 pb-24"
      >
        <View className="px-6">
          {/* Logo */}
          <View className="items-center mb-6">
            <View className="bg-white rounded-full p-2 shadow-xl">
              <View className="bg-white rounded-full p-3">
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Title */}
          <View className="items-center mb-4">
            <Text className="text-white text-5xl font-black text-center tracking-tight">
              Abhigyan
            </Text>
            <Text className="text-white text-5xl font-black text-center tracking-tight -mt-2">
              Gurukul
            </Text>
            <View className="mt-3 bg-white/20 px-4 py-1.5 rounded-full">
              <Text className="text-white text-xs font-semibold uppercase tracking-widest">
                🌳 Tree of Knowledge
              </Text>
            </View>
          </View>

          {/* Tagline */}
          <View className="bg-white/15 rounded-3xl p-5 border border-white/30 mb-6">
            <Text className="text-white text-center text-base font-medium leading-6">
              Transform your learning journey with expert guidance and modern
              teaching methods
            </Text>
          </View>

          {/* CTA Buttons */}
          <View className="gap-3 mb-6">
            <Pressable onPress={() => router.push("/(guest)/login")}>
              <View className="bg-white rounded-2xl py-4 shadow-lg">
                <View className="flex-row items-center justify-center">
                  <Text className="text-green-600 font-bold text-lg mr-2">
                    Sign In
                  </Text>
                  <Ionicons
                    name="arrow-forward-circle"
                    size={24}
                    color="#059669"
                  />
                </View>
              </View>
            </Pressable>

            <Pressable onPress={() => router.push("/(guest)/login")}>
              <View className="bg-white/15 rounded-2xl py-4 border-2 border-white/30">
                <View className="flex-row items-center justify-center">
                  <Text className="text-white font-bold text-lg mr-2">
                    Create Account
                  </Text>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          </View>

          {/* Quick stats */}
          <View className="flex-row flex-wrap justify-center gap-2">
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-bold">
                ⭐ 1000+ Students
              </Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-bold">
                🎯 95% Success
              </Text>
            </View>
            <View className="bg-white/20 px-4 py-2 rounded-full">
              <Text className="text-white text-xs font-bold">
                👨‍🏫 50+ Teachers
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Section */}
      <View className="px-6 -mt-8 mb-8">
        <View className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <View className="flex-row flex-wrap -mx-2">
            <View className="w-1/2 px-2 mb-4">
              <Text className="text-3xl font-bold text-green-600 mb-1">
                1000+
              </Text>
              <Text className="text-gray-600 text-sm">Active Students</Text>
            </View>
            <View className="w-1/2 px-2 mb-4">
              <Text className="text-3xl font-bold text-blue-600 mb-1">50+</Text>
              <Text className="text-gray-600 text-sm">Expert Teachers</Text>
            </View>
            <View className="w-1/2 px-2">
              <Text className="text-3xl font-bold text-purple-600 mb-1">
                95%
              </Text>
              <Text className="text-gray-600 text-sm">Success Rate</Text>
            </View>
            <View className="w-1/2 px-2">
              <Text className="text-3xl font-bold text-amber-600 mb-1">
                500+
              </Text>
              <Text className="text-gray-600 text-sm">Exams Conducted</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View className="px-6 mb-8">
        <Text className="text-gray-900 text-2xl font-bold mb-2">
          Why Choose Us?
        </Text>
        <Text className="text-gray-500 mb-6">
          Everything you need for successful learning
        </Text>

        {/* Feature Grid */}
        <View className="gap-3">
          {features.map((feature, index) => (
            <View
              key={index}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center">
                <View
                  className="w-12 h-12 rounded-3xl items-center justify-center mr-3"
                  style={{ backgroundColor: feature.bgColor }}
                >
                  <feature.icon
                    size={22}
                    color={feature.color}
                    strokeWidth={2}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 text-base font-bold mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {feature.description}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Courses Section */}
      <View className="px-6 mb-8">
        <Text className="text-gray-900 text-2xl font-bold mb-2">
          Popular Courses
        </Text>
        <Text className="text-gray-500 mb-6">
          Explore our comprehensive programs
        </Text>

        <View className="gap-4">
          {courses.map((course, index) => (
            <Pressable key={index}>
              <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <View className="flex-row items-center p-5">
                  <View
                    className="w-14 h-14 rounded-3xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${course.color}15` }}
                  >
                    <Ionicons
                      name={course.icon as any}
                      size={28}
                      color={course.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 text-lg font-bold mb-1">
                      {course.title}
                    </Text>
                    <Text className="text-gray-500 text-sm mb-2">
                      {course.subtitle}
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons name="people" size={14} color="#6B7280" />
                      <Text className="text-gray-500 text-xs ml-1">
                        {course.students} students
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* How It Works Section */}
      <View className="px-6 mb-8">
        <Text className="text-gray-900 text-2xl font-bold mb-2">
          How It Works
        </Text>
        <Text className="text-gray-500 mb-6">
          Simple steps to start your learning journey
        </Text>

        <View className="gap-4">
          {[
            {
              step: "1",
              title: "Register & Choose",
              desc: "Sign up and select your course",
              icon: "person-add",
            },
            {
              step: "2",
              title: "Attend Classes",
              desc: "Join live or watch recorded sessions",
              icon: "videocam",
            },
            {
              step: "3",
              title: "Practice & Test",
              desc: "Take mock tests and practice",
              icon: "clipboard",
            },
            {
              step: "4",
              title: "Track Progress",
              desc: "Monitor your improvement",
              icon: "analytics",
            },
            {
              step: "5",
              title: "Achieve Goals",
              desc: "Reach your target with confidence",
              icon: "trophy",
            },
          ].map((item, index) => (
            <View key={index} className="flex-row items-start">
              <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-4 mt-1">
                <Text className="text-white font-bold">{item.step}</Text>
              </View>
              <View className="flex-1 bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center mb-2">
                  <Ionicons name={item.icon as any} size={20} color="#10B981" />
                  <Text className="text-gray-900 font-bold ml-2">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View className="px-6 mb-8 rounded-2xl overflow-hidden">
        <LinearGradient
          colors={["#10B981", "#059669"]}
          className="rounded-3xl p-6 shadow-xl"
        >
          <View className="items-center">
            <View className="bg-white/20 w-16 h-16 rounded-2xl items-center justify-center mb-4">
              <Ionicons name="rocket" size={32} color="#FFFFFF" />
            </View>
            <Text className="text-white text-2xl font-bold mb-2 text-center">
              Ready to Get Started?
            </Text>
            <Text className="text-white/90 mb-6 text-center">
              Join thousands of students achieving their dreams
            </Text>
            <Pressable
              onPress={() => router.push("/(guest)/login")}
              className="bg-white rounded-full py-4 px-8"
            >
              <Text className="text-green-600 font-bold text-base">
                Start Learning Today
              </Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>

      {/* Footer */}
      <View className="px-6 pb-8">
        <View className="bg-white rounded-3xl p-6 border border-gray-100">
          <Text className="text-gray-900 font-bold text-base mb-4">
            Need Help?
          </Text>
          <View className="gap-3">
            <Pressable onPress={() => router.push("/(guest)/about")}>
              <View className="flex-row items-center py-2">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#6B7280"
                />
                <Text className="text-gray-600 ml-3">About Us</Text>
              </View>
            </Pressable>
            <View className="flex-row items-center py-2">
              <Ionicons name="call-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-3">Contact Support</Text>
            </View>
            <View className="flex-row items-center py-2">
              <Ionicons name="mail-outline" size={20} color="#6B7280" />
              <Text className="text-gray-600 ml-3">
                admin@abhigyangurukul.com
              </Text>
            </View>
          </View>
        </View>

        <Text className="text-gray-400 text-xs text-center mt-6">
          © 2026 Abhigyan Gurukul. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
  },
});
