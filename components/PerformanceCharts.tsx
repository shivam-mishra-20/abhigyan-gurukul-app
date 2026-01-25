import type { StudentAnalytics } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";

const screenWidth = Dimensions.get("window").width;

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  danger: "#ef4444",
  text: "#1f2937",
};

interface PerformanceChartsProps {
  analytics: StudentAnalytics | null;
  showRecentTrend?: boolean;
}

export default function PerformanceCharts({
  analytics,
  showRecentTrend = true,
}: PerformanceChartsProps) {
  // 1. Line Chart Data (Score Trend)
  const lineData: {
    value: number;
    label: string;
    dataPointText: string;
    textColor: string;
    textShiftY: number;
    textShiftX: number;
    textFontSize: number;
  }[] = [];
  if (analytics?.recentPerformance) {
    analytics.recentPerformance.forEach((item) => {
      lineData.push({
        value: item.percent,
        label: item.label,
        dataPointText: item.percent + "%",
        textColor: THEME.text,
        textShiftY: -10,
        textShiftX: -10,
        textFontSize: 10,
      });
    });
  }

  // 2. Bar Chart Data (Subject Wise)
  const barData: {
    value: number;
    label: string;
    frontColor: string;
    topLabelComponent: () => React.ReactNode;
  }[] = [];
  if (analytics?.subjectPerformance) {
    analytics.subjectPerformance.forEach((item) => {
      barData.push({
        value: item.accuracy,
        label:
          item.subject.length > 8
            ? item.subject.substring(0, 6) + ".."
            : item.subject,
        frontColor: THEME.primary,
        topLabelComponent: () => (
          <Text style={{ color: THEME.primary, fontSize: 10, marginBottom: 2 }}>
            {item.accuracy}%
          </Text>
        ),
      });
    });
  }

  // 3. Pie Chart Data (Overall Accuracy)
  const pieData = [
    {
      value: analytics?.overallStats?.correct || 0,
      color: THEME.primary,
      text: "Correct",
    },
    {
      value: analytics?.overallStats?.incorrect || 0,
      color: THEME.danger,
      text: "Wrong",
    },
    {
      value: analytics?.overallStats?.unattempted || 0,
      color: "#e5e7eb",
      text: "Skip",
    },
  ];

  return (
    <View>
      {/* 1. Score Trend (Line Chart) */}
      {showRecentTrend && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Performance Trend
            </Text>
            <Ionicons name="trending-up" size={20} color={THEME.primary} />
          </View>

          {lineData.length > 0 ? (
            <View style={{ overflow: "hidden" }}>
              <LineChart
                data={lineData}
                color={THEME.primary}
                thickness={3}
                dataPointsColor={THEME.primary}
                startFillColor={THEME.primary}
                endFillColor={THEME.primary + "10"}
                startOpacity={0.2}
                endOpacity={0.05}
                initialSpacing={20}
                noOfSections={4}
                maxValue={100}
                yAxisColor="lightgray"
                xAxisColor="lightgray"
                yAxisTextStyle={{ color: "gray", fontSize: 10 }}
                rulesColor="lightgray"
                rulesType="solid"
                height={180}
                width={screenWidth - 80}
                adjustToWidth
                curved
                isAnimated
              />
            </View>
          ) : (
            <Text className="text-gray-400 text-center py-10">
              No exam data available yet
            </Text>
          )}
        </View>
      )}

      {/* 2. Subject Wise Performance (Bar Chart) */}
      {barData.length > 0 && (
        <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Subject Accuracy
            </Text>
            <Ionicons name="library" size={20} color={THEME.primary} />
          </View>

          <BarChart
            data={barData}
            barWidth={30}
            spacing={24}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: "gray" }}
            noOfSections={3}
            maxValue={100}
            height={150}
            width={screenWidth - 80}
            isAnimated
          />
        </View>
      )}

      {/* 3. Overall Statistics (Pie Chart) */}
      <View className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-900 text-lg font-bold">
            Overall Accuracy
          </Text>
          <Ionicons name="pie-chart" size={20} color={THEME.primary} />
        </View>

        <View className="flex-row items-center justify-center">
          <PieChart
            data={pieData}
            donut
            showGradient
            sectionAutoFocus
            radius={70}
            innerRadius={50}
            innerCircleColor={"white"}
            centerLabelComponent={() => {
              return (
                <View className="items-center justify-center">
                  <Text className="text-xl font-bold text-gray-800">
                    {analytics?.accuracy || 0}%
                  </Text>
                  <Text className="text-xs text-gray-500">Accuracy</Text>
                </View>
              );
            }}
          />

          {/* Legend */}
          <View className="ml-8 justify-center gap-3">
            <View className="flex-row items-center gap-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: THEME.primary }}
              />
              <Text className="text-gray-600 text-xs">Correct</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: THEME.danger }}
              />
              <Text className="text-gray-600 text-xs">Incorrect</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <View className="w-3 h-3 rounded-full bg-gray-200" />
              <Text className="text-gray-600 text-xs">Unattempted</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
