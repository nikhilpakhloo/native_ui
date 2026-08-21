import { useColorTheme } from '@/hooks/useColorTheme';
import { useVideoStore } from '@/store/videoStore';
import { router } from 'expo-router';
import { isIOS } from '@/utils/platform';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_ASPECT_RATIO = 16 / 9;
const VIDEO_HEIGHT = SCREEN_WIDTH / VIDEO_ASPECT_RATIO;

export default function VideoPlayerScreen() {
    const { activeVideo, clearActiveVideo } = useVideoStore();
    const { colors } = useColorTheme();
    const { top, bottom } = useSafeAreaInsets();

    const player = useVideoPlayer(activeVideo?.videoUrl ?? '', (player) => {
        player.loop = true;
        player.muted = false;
        player.play();
    });

    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (activeVideo) {
            player.replaceAsync(activeVideo.videoUrl).catch(console.warn);
            player.play();
        }
    }, [activeVideo, player]);

    if (!activeVideo) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.background as any, paddingTop: !isIOS ? top : 0 }]}>
            <View style={[styles.videoContainer, { height: VIDEO_HEIGHT }]}>
                <VideoView
                    player={player}
                    style={StyleSheet.absoluteFill}
                    nativeControls={true}
                    contentFit="cover"
                    allowsPictureInPicture={true}
                    startsPictureInPictureAutomatically={true}
                />
                <Pressable
                    style={styles.muteButton}
                    onPress={() => {
                        player.muted = !isMuted;
                        setIsMuted(!isMuted);
                    }}
                >
                    <SymbolView name={isMuted ? { ios: 'speaker.slash.fill', android: 'volume_off' } : { ios: 'speaker.wave.2.fill', android: 'volume_up' }} size={20} tintColor="white" />
                </Pressable>
                {!isIOS && (
                    <Pressable
                        style={styles.closeButton}
                        onPress={() => {
                            router.back();
                            clearActiveVideo();
                        }}
                    >
                        <SymbolView name={{ ios: 'chevron.down', android: 'expand_more' }} size={24} tintColor="white" />
                    </Pressable>
                )}
            </View>

            <ScrollView style={styles.detailsContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.headerInfo}>
                    <Text style={[styles.title, { color: colors.text as any }]}>{activeVideo.title}</Text>
                    <Text style={[styles.stats, { color: colors.textSecondary as any }]}>{activeVideo.views} • {activeVideo.time}</Text>
                    <View style={styles.channelRow}>
                        <Image source={{ uri: activeVideo.thumbnailUrl }} style={styles.channelAvatar} />
                        <Text style={[styles.channelName, { color: colors.text as any }]}>{activeVideo.channelName}</Text>
                        <Pressable style={styles.subscribeBtn}>
                            <Text style={styles.subscribeText}>Subscribe</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Dummy Comments Section */}
                <View style={[styles.commentsSection, { borderTopColor: colors.border as any }]}>
                    <Text style={[styles.commentsTitle, { color: colors.text as any }]}>Comments  142</Text>

                    <View style={styles.commentItem}>
                        <View style={styles.commentAvatar} />
                        <View style={styles.commentBody}>
                            <Text style={[styles.commentUser, { color: colors.textSecondary as any }]}>@user123 • 2 hours ago</Text>
                            <Text style={[styles.commentText, { color: colors.text as any }]}>This presentation modal feels super native and fast!</Text>
                        </View>
                    </View>

                    <View style={styles.commentItem}>
                        <View style={[styles.commentAvatar, { backgroundColor: '#ff5555' }]} />
                        <View style={styles.commentBody}>
                            <Text style={[styles.commentUser, { color: colors.textSecondary as any }]}>@zustand_fan • 5 hours ago</Text>
                            <Text style={[styles.commentText, { color: colors.text as any }]}>Zustand makes this incredibly easy to manage without prop drilling.</Text>
                        </View>
                    </View>

                    <View style={styles.commentItem}>
                        <View style={[styles.commentAvatar, { backgroundColor: '#55ff55' }]} />
                        <View style={styles.commentBody}>
                            <Text style={[styles.commentUser, { color: colors.textSecondary as any }]}>@react_native_dev • 1 day ago</Text>
                            <Text style={[styles.commentText, { color: colors.text as any }]}>Expo video is a huge upgrade for performance.</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        width: SCREEN_WIDTH,
        backgroundColor: '#000',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
    },
    muteButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
    },
    detailsContainer: {
        flex: 1,
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
        backgroundColor: '#444',
        marginRight: 12,
    },
    channelName: {
        fontSize: 15,
        fontWeight: '600',
        flex: 1,
    },
    subscribeBtn: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    subscribeText: {
        color: 'black',
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
        backgroundColor: '#55ccff',
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
