import { addBookmark, getCourseBookmarks, getVideoPosition, removeBookmarkByLecture, saveVideoPosition, updateCourseProgress } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Pressable,
    StatusBar,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const THEME = {
  primary: "#059669",
  primaryLight: "#10b981",
  dark: "#1f2937",
};

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  
  // Already a video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

export default function VideoPlayerScreen() {
  const { courseId, lectureId, videoUrl, title } = useLocalSearchParams<{
    courseId: string;
    lectureId: string;
    videoUrl: string;
    title: string;
  }>();
  
  const router = useRouter();
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState<string | null>(null);
  const [initialSeek, setInitialSeek] = useState<number | null>(null);
  
  const videoId = extractYouTubeId(videoUrl || "");
  
  // Load saved position and bookmark status
  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !lectureId) return;
      
      try {
        const [positionData, bookmarks] = await Promise.all([
          getVideoPosition(courseId, lectureId).catch(() => ({ position: 0

 })),
          getCourseBookmarks(courseId).catch(() => []),
        ]);
        
        if (positionData.position > 0) {
          setInitialSeek(positionData.position);
        }
        
        const bookmark = bookmarks.find(b => b.lectureId === lectureId);
        if (bookmark) {
          setIsBookmarked(true);
          setBookmarkId(bookmark._id);
        }
      } catch (error) {
        console.error("Error loading video data:", error);
      }
    };
    
    loadData();
  }, [courseId, lectureId]);
  
  // Save position periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playing && currentTime > 0 && courseId && lectureId) {
        await saveVideoPosition(courseId, lectureId, Math.floor(currentTime)).catch(() => {});
      }
    }, 10000); // Save every 10 seconds
    
    return () => clearInterval(interval);
  }, [playing, currentTime, courseId, lectureId]);
  
  // Hide controls after delay
  useEffect(() => {
    if (showControls && playing) {
      const timeout = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [showControls, playing]);
  
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      // Mark as completed
      if (courseId && lectureId) {
        updateCourseProgress(courseId, lectureId, Math.floor(duration / 60)).catch(() => {});
        saveVideoPosition(courseId, lectureId, 0).catch(() => {}); // Reset position
      }
    }
    if (state === "playing") {
      setPlaying(true);
      setLoading(false);
    }
    if (state === "paused") {
      setPlaying(false);
    }
    if (state === "buffering") {
      setLoading(true);
    }
  }, [courseId, lectureId, duration]);
  
  const onReady = useCallback(() => {
    setLoading(false);
    if (initialSeek && initialSeek > 0) {
      playerRef.current?.seekTo(initialSeek, true);
    }
  }, [initialSeek]);
  
  const handlePlayPause = () => {
    setPlaying((prev) => !prev);
    setShowControls(true);
  };
  
  const handleSeek = async (seconds: number) => {
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    playerRef.current?.seekTo(newTime, true);
    setCurrentTime(newTime);
  };
  
  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  };
  
  const handleBookmark = async () => {
    if (!courseId || !lectureId) return;
    
    try {
      if (isBookmarked && bookmarkId) {
        await removeBookmarkByLecture(courseId, lectureId);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const bookmark = await addBookmark({
          courseId,
          lectureId,
          lectureTitle: title || "Lecture",
          timestamp: Math.floor(currentTime),
        });
        setIsBookmarked(true);
        setBookmarkId(bookmark._id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update bookmark");
    }
  };
  
  const handleClose = async () => {
    // Save position before closing
    if (courseId && lectureId && currentTime > 0) {
      await saveVideoPosition(courseId, lectureId, Math.floor(currentTime)).catch(() => {});
    }
    router.back();
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  // Poll for current time
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playerRef.current && playing) {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [playing]);
  
  // Get duration
  useEffect(() => {
    const getDuration = async () => {
      if (playerRef.current) {
        const dur = await playerRef.current.getDuration();
        setDuration(dur);
      }
    };
    
    if (!loading) {
      setTimeout(getDuration, 1000);
    }
  }, [loading]);
  
  if (!videoId) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Ionicons name="alert-circle" size={64} color="#ef4444" />
        <Text className="text-white text-lg mt-4">Invalid video URL</Text>
        <Pressable onPress={handleClose} className="mt-6 px-6 py-3 bg-white/20 rounded-xl">
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }
  
  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      
      {/* Video Player */}
      <Pressable 
        onPress={() => setShowControls((prev) => !prev)} 
        className="flex-1 justify-center"
      >
        <YoutubePlayer
          ref={playerRef}
          height={SCREEN_HEIGHT}
          width={SCREEN_WIDTH}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
          onReady={onReady}
          playbackRate={playbackRate}
          webViewProps={{
            injectedJavaScript: `
              var element = document.getElementsByClassName('container')[0];
              if (element) element.style.position = 'absolute';
              true;
            `,
          }}
        />
      </Pressable>
      
      {/* Loading Overlay */}
      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      
      {/* Controls Overlay */}
      {showControls && (
        <View className="absolute inset-0 bg-black/30">
          {/* Top Bar */}
          <SafeAreaView edges={["top"]}>
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable onPress={handleClose} className="p-2">
                <Ionicons name="arrow-back" size={28} color="white" />
              </Pressable>
              <Text className="text-white font-semibold text-lg flex-1 mx-4" numberOfLines={1}>
                {title || "Video"}
              </Text>
              <Pressable onPress={handleBookmark} className="p-2">
                <Ionicons 
                  name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                  size={28} 
                  color={isBookmarked ? "#fbbf24" : "white"} 
                />
              </Pressable>
            </View>
          </SafeAreaView>
          
          {/* Center Controls */}
          <View className="flex-1 flex-row items-center justify-center gap-10">
            <Pressable onPress={() => handleSeek(-10)} className="p-4">
              <Ionicons name="play-back" size={32} color="white" />
              <Text className="text-white text-xs text-center">10s</Text>
            </Pressable>
            <Pressable onPress={handlePlayPause} className="p-6 bg-white/20 rounded-full">
              <Ionicons name={playing ? "pause" : "play"} size={48} color="white" />
            </Pressable>
            <Pressable onPress={() => handleSeek(10)} className="p-4">
              <Ionicons name="play-forward" size={32} color="white" />
              <Text className="text-white text-xs text-center">10s</Text>
            </Pressable>
          </View>
          
          {/* Bottom Bar */}
          <SafeAreaView edges={["bottom"]}>
            <View className="px-4 pb-4">
              {/* Progress Bar */}
              <View className="flex-row items-center mb-3">
                <Text className="text-white text-xs w-12">{formatTime(currentTime)}</Text>
                <View className="flex-1 h-1 bg-white/30 rounded-full mx-2">
                  <View 
                    className="h-full bg-white rounded-full" 
                    style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%" }}
                  />
                </View>
                <Text className="text-white text-xs w-12 text-right">{formatTime(duration)}</Text>
              </View>
              
              {/* Speed Control */}
              <View className="flex-row justify-end">
                <Pressable 
                  onPress={() => setShowSpeedMenu((prev) => !prev)}
                  className="px-4 py-2 bg-white/20 rounded-lg flex-row items-center"
                >
                  <Ionicons name="speedometer" size={18} color="white" />
                  <Text className="text-white ml-2 font-medium">{playbackRate}x</Text>
                </Pressable>
              </View>
              
              {/* Speed Menu */}
              {showSpeedMenu && (
                <View className="absolute bottom-20 right-4 bg-gray-900 rounded-xl overflow-hidden">
                  {PLAYBACK_RATES.map((rate) => (
                    <Pressable
                      key={rate}
                      onPress={() => handleSpeedChange(rate)}
                      className={`px-6 py-3 ${playbackRate === rate ? "bg-emerald-600" : ""}`}
                    >
                      <Text className="text-white font-medium">{rate}x</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </SafeAreaView>
        </View>
      )}
    </View>
  );
}
