import { useColorTheme } from '@/hooks/useColorTheme';
import { useVideoStore } from '@/store/videoStore';
import { windowHeight } from '@/utils/dimensions';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


function ActiveReelPlayer({
    videoUrl,
    isActive,
    isMuted,
}: {
    videoUrl: string;
    isActive: boolean;
    isMuted: boolean;
}) {
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
        player.muted = isMuted;
    });

    const activeVideoOverlay = useVideoStore(state => state.activeVideo);

    useEffect(() => {
        if (isActive && !activeVideoOverlay) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, activeVideoOverlay, player]);

    useEffect(() => {
        player.muted = isMuted;
    }, [isMuted, player]);

    return (
        <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            nativeControls={false}
            contentFit="cover"
        />
    );
}

export function ReelCard({
    item,
    isActive,
    isNearby,
    isMuted,
    toggleMute
}: {
    item: { videoUrl: string, thumbnailUrl: string };
    isActive: boolean;
    isNearby: boolean;
    isMuted: boolean;
    toggleMute: () => void;
    height: number;
}) {
    const insets = useSafeAreaInsets();
    const { colors } = useColorTheme();

    return (
        <View style={[styles.reelContainer, { height: windowHeight, backgroundColor: colors.black as any }]}>
            <Image source={{ uri: item.thumbnailUrl }} style={StyleSheet.absoluteFill} />

            {isNearby && (
                <ActiveReelPlayer
                    videoUrl={item.videoUrl}
                    isActive={isActive}
                    isMuted={isMuted}
                />
            )}

            <View style={[styles.rightActions, { bottom: 100 + insets.bottom }]}>
                <Pressable style={styles.actionButton} onPress={toggleMute}>
                    <View style={styles.iconContainer}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.3, borderRadius: 24 }]} pointerEvents="none" />
                        <SymbolView
                            name={isMuted ? { ios: 'speaker.slash.fill', android: 'volume_off' } : { ios: 'speaker.wave.2.fill', android: 'volume_up' }}
                            size={26}
                            tintColor={colors.white as any}
                        />
                    </View>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.3, borderRadius: 24 }]} pointerEvents="none" />
                        <SymbolView name={{ ios: 'heart.fill', android: 'favorite' }} size={32} tintColor={colors.white as any} />
                    </View>
                    <Text style={[styles.actionText, { color: colors.white as any, textShadowColor: colors.black as any }]}>1.2k</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.3, borderRadius: 24 }]} pointerEvents="none" />
                        <SymbolView name={{ ios: 'bubble.right.fill', android: 'chat_bubble' }} size={30} tintColor={colors.white as any} />
                    </View>
                    <Text style={[styles.actionText, { color: colors.white as any, textShadowColor: colors.black as any }]}>400</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.black as any, opacity: 0.3, borderRadius: 24 }]} pointerEvents="none" />
                        <SymbolView name={{ ios: 'arrowshape.turn.up.right.fill', android: 'reply' }} size={30} tintColor={colors.white as any} />
                    </View>
                    <Text style={[styles.actionText, { color: colors.white as any, textShadowColor: colors.black as any }]}>Share</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    reelContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rightActions: {
        position: 'absolute',
        right: 12,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
