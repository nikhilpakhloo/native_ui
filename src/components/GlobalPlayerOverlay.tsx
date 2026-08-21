import { useColorTheme } from '@/hooks/useColorTheme';
import { useVideoStore } from '@/store/videoStore';
import { isAndroid } from '@/utils/platform';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { runOnJS } from 'react-native-worklets';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const VIDEO_ASPECT_RATIO = 16 / 9;
const FULL_VIDEO_HEIGHT = SCREEN_WIDTH / VIDEO_ASPECT_RATIO;
const PIP_WIDTH = SCREEN_WIDTH * 0.45;
const PIP_HEIGHT = PIP_WIDTH / VIDEO_ASPECT_RATIO;
const TAB_BAR_HEIGHT = 85;

// Bottom right position
const PIP_Y = SCREEN_HEIGHT - TAB_BAR_HEIGHT - PIP_HEIGHT - 20;
const PIP_X = SCREEN_WIDTH - PIP_WIDTH - 16;

const timingConfig = { duration: 250 };

export default function GlobalPlayerOverlay() {
    const { activeVideo, clearActiveVideo } = useVideoStore();
    const { colors } = useColorTheme();
    const { top } = useSafeAreaInsets();

    const [isMinimized, setIsMinimized] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const player = useVideoPlayer(activeVideo?.videoUrl ?? null, (player) => {
        player.loop = true;
        player.muted = false;
        player.play();
    });

    // 0 = Expanded, 1 = Minimized, 2 = Dismissed
    const progress = useSharedValue(2);

    useEffect(() => {
        if (activeVideo) {
            player.replaceAsync(activeVideo.videoUrl).catch(console.warn);
            player.play();
            progress.value = withTiming(0, timingConfig);
            setIsMinimized(false);
        }
    }, [activeVideo]);

    const expandPlayer = () => {
        progress.value = withTiming(0, timingConfig);
        setIsMinimized(false);
    };

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            if (isMinimized) {
                if (e.translationY < 0) {
                    // Pulling up
                    progress.value = Math.max(0, 1 + (e.translationY / PIP_Y));
                } else if (e.translationX > 0) {
                    // Swiping right
                    progress.value = Math.min(2, 1 + (e.translationX / (SCREEN_WIDTH - PIP_X)));
                } else if (e.translationX < 0) {
                    // Swiping left
                    progress.value = Math.max(0, 1 + (e.translationX / PIP_X));
                }
            } else {
                progress.value = Math.max(0, e.translationY / PIP_Y);
            }
        })
        .onEnd((e) => {
            if (isMinimized) {
                if (e.translationX > 50 || e.velocityX > 500) {
                    progress.value = withTiming(2, timingConfig, () => {
                        runOnJS(clearActiveVideo)();
                    });
                } else if (e.translationY < -50 || e.velocityY < -500 || e.translationX < -50) {
                    progress.value = withTiming(0, timingConfig);
                    runOnJS(setIsMinimized)(false);
                } else {
                    progress.value = withTiming(1, timingConfig);
                }
            } else {
                if (e.translationY > 100 || e.velocityY > 500) {
                    progress.value = withTiming(1, timingConfig);
                    runOnJS(setIsMinimized)(true);
                } else {
                    progress.value = withTiming(0, timingConfig);
                    runOnJS(setIsMinimized)(false);
                }
            }
        });

    const animatedVideoStyle = useAnimatedStyle(() => {
        const expandedHeight = FULL_VIDEO_HEIGHT + top;
        const width = interpolate(progress.value, [0, 1, 2], [SCREEN_WIDTH, PIP_WIDTH, PIP_WIDTH], Extrapolation.CLAMP);
        const height = interpolate(progress.value, [0, 1, 2], [expandedHeight, PIP_HEIGHT, PIP_HEIGHT], Extrapolation.CLAMP);
        const translateX = interpolate(progress.value, [0, 1, 2], [0, PIP_X, SCREEN_WIDTH], Extrapolation.CLAMP);
        const translateY = interpolate(progress.value, [0, 1, 2], [0, PIP_Y, PIP_Y], Extrapolation.CLAMP);
        const borderRadius = interpolate(progress.value, [0, 1], [0, 12], Extrapolation.CLAMP);
        const paddingTop = interpolate(progress.value, [0, 1], [top, 0], Extrapolation.CLAMP);

        return {
            width,
            height,
            paddingTop,
            transform: [{ translateX }, { translateY }],
            borderRadius,
        };
    });

    const animatedBgStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP)
        };
    });

    const animatedDetailsStyle = useAnimatedStyle(() => {
        const translateY = interpolate(progress.value, [0, 1], [0, SCREEN_HEIGHT], Extrapolation.CLAMP);
        return {
            transform: [{ translateY }],
            opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP)
        };
    });

    if (!activeVideo) return null;

    return (
        <View style={styles.absoluteContainer} pointerEvents={isMinimized ? "box-none" : "auto"}>
            <Animated.View style={[styles.backgroundOverlay, { backgroundColor: colors.background as any }, animatedBgStyle]} pointerEvents="none" />

            <Animated.ScrollView
                style={[styles.detailsContainer, animatedDetailsStyle, { backgroundColor: colors.background as any }]}
                showsVerticalScrollIndicator={false}
                pointerEvents={isMinimized ? 'none' : 'auto'}
            >
                <View style={[styles.headerInfo, { paddingTop: FULL_VIDEO_HEIGHT + top + 16 }]}>
                    <Text style={[styles.title, { color: colors.text as any }]}>{activeVideo.title}</Text>
                    <Text style={[styles.stats, { color: colors.textSecondary as any }]}>{activeVideo.views} • {activeVideo.time}</Text>
                    <View style={styles.channelRow}>
                        <Image source={{ uri: activeVideo.thumbnailUrl }} style={[styles.channelAvatar, { backgroundColor: colors.border as any }]} />
                        <Text style={[styles.channelName, { color: colors.text as any }]}>{activeVideo.channelName}</Text>
                        <Pressable style={[styles.subscribeBtn, { backgroundColor: colors.text as any }]}>
                            <Text style={[styles.subscribeText, { color: colors.background as any }]}>Subscribe</Text>
                        </Pressable>
                    </View>
                </View>

                <View style={[styles.commentsSection, { borderTopColor: colors.border as any }]}>
                    <Text style={[styles.commentsTitle, { color: colors.text as any }]}>Comments  142</Text>
                    <View style={styles.commentItem}>
                        <View style={[styles.commentAvatar, { backgroundColor: colors.textSecondary as any }]} />
                        <View style={styles.commentBody}>
                            <Text style={[styles.commentUser, { color: colors.textSecondary as any }]}>@user123 • 2 hours ago</Text>
                            <Text style={[styles.commentText, { color: colors.text as any }]}>This feels exactly like a true floating window!</Text>
                        </View>
                    </View>
                    <View style={styles.commentItem}>
                        <View style={[styles.commentAvatar, { backgroundColor: colors.red as any }]} />
                        <View style={styles.commentBody}>
                            <Text style={[styles.commentUser, { color: colors.textSecondary as any }]}>@zustand_fan • 5 hours ago</Text>
                            <Text style={[styles.commentText, { color: colors.text as any }]}>Smooth transitions without the bouncy spring!</Text>
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.videoWrapper, animatedVideoStyle, { backgroundColor: colors.background as any, shadowColor: colors.black as any }]}>
                    <VideoView
                        player={player}
                        style={{ width: '100%', height: '100%' }}
                        nativeControls={!isMinimized}
                        contentFit="cover"
                        allowsPictureInPicture={true}
                        startsPictureInPictureAutomatically={true}
                    />

                    {!isMinimized && (
                        <>
                            {/* Minimize / Resize Button (Android Only) */}
                            {isAndroid && (
                                <Pressable 
                                    style={[styles.controlButton, { top: 16 + top, left: 16 }]} 
                                    onPress={() => {
                                        progress.value = withTiming(1, timingConfig);
                                        runOnJS(setIsMinimized)(true);
                                    }}
                                >
                                    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.6, borderRadius: 20 }]} pointerEvents="none" />
                                    <SymbolView name={{ ios: 'chevron.down', android: 'expand_more' }} size={24} tintColor={colors.white as any} />
                                </Pressable>
                            )}

                            {/* Mute Button (Both Targets) */}
                            <Pressable 
                                style={[styles.controlButton, { top: 16 + top, right: 16 }]} 
                                onPress={() => {
                                    const newMuted = !isMuted;
                                    player.muted = newMuted;
                                    setIsMuted(newMuted);
                                }}
                            >
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.6, borderRadius: 20 }]} pointerEvents="none" />
                                <SymbolView name={isMuted ? { ios: 'speaker.slash.fill', android: 'volume_off' } : { ios: 'speaker.wave.2.fill', android: 'volume_up' }} size={20} tintColor={colors.white as any} />
                            </Pressable>
                        </>
                    )}

                    {isMinimized && (
                        <Pressable style={StyleSheet.absoluteFill} onPress={expandPlayer} />
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    absoluteContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT,
        zIndex: 999,
        elevation: 10,
    },
    backgroundOverlay: {
        ...StyleSheet.absoluteFill,
    },
    videoWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    controlButton: {
        position: 'absolute',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    detailsContainer: {
        ...StyleSheet.absoluteFill,
        zIndex: 5,
    },
    headerInfo: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    stats: {
        fontSize: 13,
        marginBottom: 16,
    },
    channelRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    channelAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 12,
    },
    channelName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    subscribeBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    subscribeText: {
        fontWeight: 'bold',
    },
    commentsSection: {
        borderTopWidth: 1,
        padding: 16,
    },
    commentsTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginRight: 12,
    },
    commentBody: {
        flex: 1,
    },
    commentUser: {
        fontSize: 12,
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
    }
});
