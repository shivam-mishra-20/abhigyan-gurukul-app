import { getCourseDetail, getVideoPosition, saveVideoPosition, updateCourseProgress } from "@/lib/enhancedApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";

interface Lecture {
  title: string;
  videoUrl?: string;
  youtubeVideoId?: string;
  order: number;
  duration?: number;
  youtubeMeta?: {
    durationSec: number;
    thumbnail: string;
    title: string;
  };
}

interface Module {
  title: string;
  description?: string;
  lectures: Lecture[];
}

// Extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
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

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function VideoPlayerScreen() {
  const { courseId, lectureId, videoUrl, title, moduleIndex } = useLocalSearchParams<{
    courseId: string;
    lectureId: string;
    videoUrl: string;
    title: string;
    moduleIndex: string;
  }>();
  
  const router = useRouter();
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const playerRef = useRef<YoutubeIframeRef>(null);
  
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [initialSeek, setInitialSeek] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  
  // Course data
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  
  const videoId = extractYouTubeId(videoUrl || "");

  // Handle orientation and BackHandler
  useEffect(() => {
    const handleBackPress = () => {
      if (isFullscreen) {
        setIsFullscreen(false);
        return true;
      }
      return false;
    };

    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => backHandler.remove();
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  }, [isFullscreen]);

  // Handle Tab Bar & Header Visibility with cleanup and delay for smoother transitions
  useEffect(() => {
    let timeout: any;
    
    if (isFullscreen) {
      // Hide immediately when entering fullscreen
      navigation.setOptions({
        tabBarStyle: { display: "none" },
        headerShown: false,
      });
    } else {
      // Delay showing tabs when exiting fullscreen to avoid layout glitches during rotation
      timeout = setTimeout(() => {
        navigation.setOptions({
          tabBarStyle: { display: "flex" },
          headerShown: false,
        });
      }, 1000);
    }
    
    // cleanup
    return () => {
      clearTimeout(timeout);
      // Ensure tabs are visible when unmounting this component
      navigation.setOptions({
        tabBarStyle: { display: "flex" },
        headerShown: false,
      });
    };
  }, [isFullscreen, navigation]);
  
  // Autohide controls
  useEffect(() => {
    if (playing && showControls && !isSeeking) {
      const timeout = setTimeout(() => setShowControls(false), 4000);
      return () => clearTimeout(timeout);
    }
  }, [playing, showControls, isSeeking]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!courseId || !lectureId) return;
      try {
        const [positionData, courseData] = await Promise.all([
          getVideoPosition(courseId, lectureId).catch(() => ({ position: 0 })),
          getCourseDetail(courseId).catch(() => null),
        ]);
        
        if (positionData.position > 0) setInitialSeek(positionData.position);
        if (courseData) {
          setCourseTitle(courseData.title);
          const modIdx = moduleIndex ? parseInt(moduleIndex) : 0;
          if (courseData.syllabus && courseData.syllabus[modIdx]) {
            setCurrentModule(courseData.syllabus[modIdx]);
            // Find current lecture
            const lecIdx = courseData.syllabus[modIdx].lectures.findIndex(
              (l: Lecture, i: number) => i.toString() === lectureId || l.youtubeVideoId === videoId || extractYouTubeId(l.videoUrl || "") === videoId
            );
            if (lecIdx >= 0) setCurrentLectureIndex(lecIdx);
          }
        }
      } catch (error) {
        console.error("Error loading video data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId, lectureId, moduleIndex, videoId]);

  // State sync loop
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playerRef.current && playing && !isSeeking) {
        try {
          const t = await playerRef.current.getCurrentTime();
          const d = await playerRef.current.getDuration();
          if (t && !isNaN(t)) setCurrentTime(t);
          if (d && !isNaN(d) && d > 0) setDuration(d);
        } catch {}
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, isSeeking]);

  // Save progress and mark complete at 80% threshold
  useEffect(() => {
    const interval = setInterval(async () => {
      if (playing && currentTime > 0 && courseId && lectureId) {
        // Save video position
        await saveVideoPosition(courseId, lectureId, Math.floor(currentTime)).catch(() => {});
        
        // Mark as complete when 80% watched
        if (!hasMarkedComplete && duration > 0 && (currentTime / duration) >= 0.8) {
          console.log('[Progress] Marking lecture complete at 80% threshold');
          await updateCourseProgress(courseId, lectureId, Math.floor(currentTime / 60)).catch(() => {});
          setHasMarkedComplete(true);
        }
      }
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [playing, currentTime, duration, courseId, lectureId, hasMarkedComplete]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
      setShowControls(true);
      if (courseId && lectureId) {
        updateCourseProgress(courseId, lectureId, Math.floor(duration / 60)).catch(() => {});
        saveVideoPosition(courseId, lectureId, 0).catch(() => {});
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



  const handleSeek = useCallback((value: number) => {
    setCurrentTime(value);
  }, []);

  const handleSeekComplete = useCallback((value: number) => {
    playerRef.current?.seekTo(value, true);
    setIsSeeking(false);
    if (playing) {
      setTimeout(() => setShowControls(false), 2000);
    }
  }, [playing]);

  const navigateToLecture = (lecture: Lecture, index: number) => {
    const ytId = lecture.youtubeVideoId || extractYouTubeId(lecture.videoUrl || "") || "";
    router.replace({
      pathname: "/video/[lectureId]",
      params: {
        courseId,
        lectureId: index.toString(),
        videoUrl: ytId,
        title: lecture.title,
        moduleIndex: moduleIndex || "0",
      },
    });
  };

  const currentLecture = currentModule?.lectures[currentLectureIndex];

  // Determine player dimensions
  const VIDEO_ASPECT_RATIO = 16 / 9;
  let videoWidth = windowWidth;
  let videoHeight = windowWidth / VIDEO_ASPECT_RATIO;

  if (isFullscreen) {
    const screenAspectRatio = windowWidth / windowHeight;
    if (screenAspectRatio > VIDEO_ASPECT_RATIO) {
      // Screen is wider than video (e.g. landscape phone) - fit by height
      videoHeight = windowHeight;
      videoWidth = videoHeight * VIDEO_ASPECT_RATIO;
    } else {
      // Screen is taller/narrower (e.g. portrait or tablet) - fit by width
      videoWidth = windowWidth;
      videoHeight = videoWidth / VIDEO_ASPECT_RATIO;
    }
  }

  // Container dimensions (always full space in fullscreen)
  const containerWidth = isFullscreen ? windowWidth : windowWidth;
  // Increase portrait height slightly (approx 3:2 ratio) as requested, otherwise fullscreen height
  const containerHeight = isFullscreen ? windowHeight : windowWidth * 0.65;
  
  if (!videoId) return null;

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />
      
      {/* Video Area */}
      <View style={{ width: containerWidth, height: containerHeight, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}>
        <YoutubePlayer
          ref={playerRef}
          height={videoHeight}
          width={videoWidth}
          videoId={videoId}
          play={playing}
          onChangeState={onStateChange}
          onReady={onReady}
          initialPlayerParams={{
            controls: true, // Show native controls
            modestbranding: false,
            rel: false,
            preventFullScreen: true,
          }}
        />

        {/* Loading Spinner */}
        {loading && (
          <View style={[StyleSheet.absoluteFill, styles.center]}>
            <ActivityIndicator size="large" color="#059669" />
          </View>
        )}

        {/* Touch Overlay (Removed to allow interaction with native player) */}
        {/* <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => setShowControls(v => !v)}
        /> */}

        {/* Custom Fullscreen Toggle Overlay - Always visible, non-blocking */}
        <View style={styles.fullscreenOverlay} pointerEvents="box-none">
          <Pressable 
            style={styles.floatingFullscreenBtn}
            onPress={() => setIsFullscreen(f => !f)}
            hitSlop={16}
          >
            <Ionicons 
              name={isFullscreen ? "contract" : "expand"} 
              size={24} 
              color="white" 
            />
          </Pressable>
        </View>

        {/* Legacy Controls Overlay (Hidden/Removed) */}
        {false && (
          <View style={[StyleSheet.absoluteFill, styles.controlsOverlay]} pointerEvents="box-none">
            {/* ... code ... */}
          </View>
        )}
      </View>

      {/* Info & Up Next (Portrait only) */}
      {!isFullscreen && (
        <ScrollView style={styles.scrollContent}>
          {/* Header */}
          <View style={styles.infoContainer}>
            <View style={styles.row}>
               <Pressable 
                 onPress={() => {
                   if (isFullscreen) setIsFullscreen(false);
                   else router.back();
                 }} 
                 style={{ marginRight: 10 }}
               >
                 <Ionicons name="arrow-back" size={24} color="#1f2937" />
               </Pressable>
               <Text style={styles.courseTitle} numberOfLines={1}>{courseTitle}</Text>
            </View>
            <Text style={styles.videoTitle}>{title || currentLecture?.title}</Text>
            {currentModule && (
              <Text style={styles.moduleText}>
                Module: {currentModule.title}
              </Text>
            )}
          </View>

          {/* Up Next */}
          {currentModule && (
            <View style={styles.listContainer}>
              <Text style={styles.listHeader}>Up Next</Text>
              {currentModule.lectures.map((item, idx) => {
                const isCurrent = idx === currentLectureIndex;
                const ytId = item.youtubeVideoId || extractYouTubeId(item.videoUrl || "");
                const thumb = item.youtubeMeta?.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null);
                
                return (
                  <Pressable 
                    key={idx}
                    style={[styles.itemRow, isCurrent && styles.activeItem]}
                    onPress={() => !isCurrent && navigateToLecture(item, idx)}
                  >
                    <View style={styles.thumbContainer}>
                      {thumb ? (
                        <Image source={{ uri: thumb }} style={styles.thumbImage} resizeMode="cover" />
                      ) : (
                         <View style={[styles.thumbImage, styles.center, {backgroundColor: '#e5e7eb'}]}>
                           <Ionicons name="play-circle" size={24} color="#9ca3af" />
                         </View>
                      )}
                      {item.youtubeMeta?.durationSec && (
                        <View style={styles.durationBadge}>
                           <Text style={styles.durationText}>{formatDuration(item.youtubeMeta.durationSec)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={[styles.itemTitle, isCurrent && {color: '#059669', fontWeight: '700'}]} numberOfLines={2}>
                        {idx + 1}. {item.title}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.playingText}>Now Playing</Text>
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
          <View style={{height: 40}} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end', // Position bottom
    alignItems: 'flex-end', // Position right
    padding: 16,
    zIndex: 10,
    pointerEvents: 'box-none',
  },
  floatingFullscreenBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10, // Bottom margin to avoid native seekbar if visible
    marginRight: 2, // Right margin
  },
  controlsOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 10,
  },
  topControls: {
    height: 50,
    justifyContent: 'center',
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  playButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControls: {
    paddingBottom: 5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    width: 45,
    textAlign: 'center',
  },
  fullscreenBtn: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  moduleText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activeItem: {
    backgroundColor: '#f0fdf4',
    marginHorizontal: -8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  thumbContainer: {
    width: 120,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  playingText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 2,
  },
});
