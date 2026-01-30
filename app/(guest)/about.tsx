import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Target, Users } from "lucide-react-native";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function GuestAbout() {
  const router = useRouter();

  const achievements = [
    { label: "Years of Excellence", value: "10+", icon: "trophy" },
    { label: "Success Rate", value: "90%", icon: "trending-up" },
    { label: "Expert Teachers", value: "50+", icon: "people" },
    { label: "Happy Students", value: "1000+", icon: "happy" },
  ];

  const features = [
    {
      id: "01",
      title: "Learning Approach",
      description:
        "We integrate ancient wisdom with modern education, nurturing intellectual, emotional, and spiritual growth. Our focus is not just on academic excellence but also on character building and personal development.",
      color: "#10B981",
      icon: "book-outline",
    },
    {
      id: "02",
      title: "Personalized Attention",
      description:
        "We believe every student is unique. Our customized teaching methods ensure that each student receives individual attention tailored to their learning style and pace.",
      color: "#EC4899",
      icon: "person-outline",
    },
    {
      id: "03",
      title: "Experienced Mentors",
      description:
        "Our educators are not just subject experts but also mentors who inspire and guide students. They bring a wealth of knowledge and real-world experience.",
      color: "#10B981",
      icon: "people-outline",
    },
    {
      id: "04",
      title: "Values and Discipline",
      description:
        "Rooted in the Gurukul tradition, we emphasize discipline, respect, and moral values. Our students learn the importance of integrity, humility, and compassion.",
      color: "#EC4899",
      icon: "heart-outline",
    },
    {
      id: "05",
      title: "Comprehensive Curriculum",
      description:
        "We offer a diverse range of courses from competitive exams like JEE, Pre-Medical, and Commerce to foundational courses and Olympiad preparation.",
      color: "#10B981",
      icon: "library-outline",
    },
    {
      id: "06",
      title: "Learning Environment",
      description:
        "Our campus is designed to provide a peaceful and inspiring environment, conducive to learning and self-discovery.",
      color: "#EC4899",
      icon: "leaf-outline",
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Logo */}
      <LinearGradient
        colors={["#10B981", "#059669"]}
        className="pt-14 pb-12 px-6"
      >
        <View className="items-center mb-6">
          <View className="bg-white rounded-full p-2 shadow-xl mb-4">
            <View className="bg-white rounded-full p-3">
              <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text className="text-white text-3xl font-bold mb-2">
            Abhigyan Gurukul
          </Text>
          <Text className="text-white/90 text-base text-center">
            Nurturing Minds, Building Futures
          </Text>
          <View className="mt-3 bg-white/20 px-4 py-1.5 rounded-full">
            <Text className="text-white text-xs font-semibold uppercase tracking-widest">
              🌳 Tree of Knowledge
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row flex-wrap -mx-2">
          {achievements.slice(0, 4).map((item, index) => (
            <View key={index} className="w-1/2 px-2 mb-3">
              <View className="bg-white/20 rounded-3xl p-4 items-center">
                <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                <Text className="text-white text-2xl font-bold mt-2">
                  {item.value}
                </Text>
                <Text className="text-white/90 text-xs text-center mt-1">
                  {item.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View className="px-6 py-6">
        {/* Introduction */}
        <View className="mb-6">
          <Text className="text-gray-900 text-2xl font-bold mb-4 text-center">
            Introduction
          </Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <Text className="text-gray-700 text-base leading-7 mb-4 text-center">
              At{" "}
              <Text className="text-green-600 font-semibold">
                Abhigyan Gurukul
              </Text>
              , we blend the wisdom of{" "}
              <Text className="font-semibold">ancient</Text> traditions with{" "}
              <Text className="text-green-600 font-semibold">
                modern education
              </Text>{" "}
              to nurture young minds in a way that fosters{" "}
              <Text className="text-green-600 font-semibold">intellectual</Text>
              , <Text className="text-green-600 font-semibold">emotional</Text>,
              and{" "}
              <Text className="text-green-600 font-semibold">
                spiritual growth
              </Text>
              . Rooted in the principles of{" "}
              <Text className="text-green-600 font-semibold">
                Gurukul-style learning
              </Text>
              , our institution is committed to providing a well-rounded
              education that prepares students for both{" "}
              <Text className="text-green-600 font-semibold">
                academic excellence
              </Text>{" "}
              and{" "}
              <Text className="text-green-600 font-semibold">
                personal development
              </Text>
              .
            </Text>

            <Text className="text-gray-700 text-base leading-7 text-center">
              Our curriculum integrates{" "}
              <Text className="text-green-600 font-semibold">time-honored</Text>{" "}
              values,{" "}
              <Text className="text-green-600 font-semibold">
                disciplined learning
              </Text>
              , and a deep respect for nature, ensuring that students grow into{" "}
              <Text className="text-green-600 font-semibold">responsible</Text>,{" "}
              <Text className="text-green-600 font-semibold">
                compassionate
              </Text>
              , and{" "}
              <Text className="text-green-600 font-semibold">
                knowledgeable
              </Text>{" "}
              individuals. With experienced mentors, a serene learning
              environment, and a focus on both{" "}
              <Text className="text-green-600 font-semibold">traditional</Text>{" "}
              and{" "}
              <Text className="text-green-600 font-semibold">contemporary</Text>{" "}
              knowledge,{" "}
              <Text className="text-green-600 font-semibold">
                Abhigyan Gurukul
              </Text>{" "}
              is <Text className="italic">more</Text> than just a Coaching
              institute—it&apos;s a journey toward{" "}
              <Text className="text-green-600 font-semibold">
                enlightenment
              </Text>{" "}
              and{" "}
              <Text className="text-green-600 font-semibold">
                self-discovery
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* Why Choose Abhigyan Gurukul */}
        <View className="mb-6">
          <Text className="text-gray-900 text-2xl font-bold mb-4 text-center">
            Why Choose Abhigyan Gurukul?
          </Text>
          <View className="gap-3">
            {features.map((feature, index) => (
              <View
                key={index}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100"
              >
                <View className="flex-row items-start">
                  <View
                    className="w-12 h-12 rounded-3xl items-center justify-center mr-3"
                    style={{ backgroundColor: `${feature.color}15` }}
                  >
                    <Ionicons
                      name={feature.icon as any}
                      size={24}
                      color={feature.color}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-bold text-lg mb-2"
                      style={{ color: feature.color }}
                    >
                      {feature.id} {feature.title}
                    </Text>
                    <Text className="text-gray-600 leading-6">
                      {feature.description}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Our Vision */}
        <View className="mb-6 rounded-2xl overflow-hidden">
          <Text className="text-gray-900 text-2xl font-bold mb-4 text-center">
            Our Vision
          </Text>
          <LinearGradient
            colors={["#14B8A6", "#0D9488"]}
            className="rounded-4xl p-6"
          >
            <View className="items-center mb-4">
              <View className="bg-white/20 rounded-full p-3">
                <Target size={32} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
            <Text className="text-white text-base leading-7 text-center">
              To make <Text className="font-bold">quality education</Text>{" "}
              accessible at every level of education. To make learning a process
              to <Text className="font-bold">enjoy</Text> and{" "}
              <Text className="font-bold">grow</Text> rather than a hassle. To{" "}
              <Text className="font-bold">prioritize</Text> students to ensure
              learning, rather than providing standardized and same content to
              everyone. To provide{" "}
              <Text className="font-bold">customized attention</Text> to{" "}
              <Text className="font-bold">every type</Text> of students, so that
              each one can grow ahead from the{" "}
              <Text className="font-bold">stage</Text> they started.
            </Text>
          </LinearGradient>
        </View>

        {/* Contact Section */}
        <View className="mb-6 rounded-2xl overflow-hidden">
          <Text className="text-gray-900 text-2xl font-bold mb-4 text-center">
            Get In Touch
          </Text>
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <Pressable
              onPress={() => Linking.openURL("mailto:info@abhigyangurukul.com")}
              className="flex-row items-center mb-4"
            >
              <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail" size={20} color="#10B981" />
              </View>
              <Text className="text-gray-600 flex-1">
                info@abhigyangurukul.com
              </Text>
            </Pressable>

            <Pressable
              onPress={() => Linking.openURL("tel:+919876543210")}
              className="flex-row items-center mb-4"
            >
              <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mr-3">
                <Ionicons name="call" size={20} color="#3B82F6" />
              </View>
              <Text className="text-gray-600">+91 98765 43210</Text>
            </Pressable>

            <View className="flex-row items-start">
              <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mr-3 mt-1">
                <Ionicons name="location" size={20} color="#8B5CF6" />
              </View>
              <Text className="text-gray-600 flex-1">
                123 Education Lane, Knowledge Park,{"\n"}New Delhi, India -
                110001
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <LinearGradient
          colors={["#10B981", "#059669"]}
          className="rounded-2xl p-6 mb-6"
        >
          <View className="items-center">
            <View className="bg-white/20 rounded-full p-3 mb-3">
              <Users size={32} color="#FFFFFF" strokeWidth={2} />
            </View>
            <Text className="text-white font-bold text-xl mb-2 text-center">
              Ready to Start Learning?
            </Text>
            <Text className="text-white/90 text-sm text-center mb-4">
              Join thousands of students achieving their academic goals
            </Text>
            <Pressable
              onPress={() => router.push("/(guest)/login")}
              className="bg-white rounded-full py-3 px-8"
            >
              <Text className="text-green-600 font-bold text-base">
                Register Today
              </Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Social Links */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <Text className="text-gray-900 font-bold mb-3 text-center">
            Follow Us
          </Text>
          <View className="flex-row justify-center gap-4">
            <Pressable
              onPress={() => Linking.openURL("https://facebook.com")}
              className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="logo-facebook" size={24} color="#3B82F6" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://instagram.com")}
              className="bg-pink-100 w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="logo-instagram" size={24} color="#EC4899" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://youtube.com")}
              className="bg-red-100 w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="logo-youtube" size={24} color="#EF4444" />
            </Pressable>
            <Pressable
              onPress={() => Linking.openURL("https://linkedin.com")}
              className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center"
            >
              <Ionicons name="logo-linkedin" size={24} color="#6366F1" />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 60,
    height: 60,
  },
});
