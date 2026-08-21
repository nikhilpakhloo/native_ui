import { useColorTheme } from '@/hooks/useColorTheme';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect } from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: windowHeight } = Dimensions.get('window');

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

    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player]);

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
    toggleMute: () => void
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
                        <SymbolView
                            name={isMuted ? { ios: 'speaker.slash.fill', android: 'volume_off' } : { ios: 'speaker.wave.2.fill', android: 'volume_up' }}
                            size={26}
                            tintColor="white"
                        />
                    </View>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <SymbolView name={{ ios: 'heart.fill', android: 'favorite' }} size={32} tintColor="white" />
                    </View>
                    <Text style={styles.actionText}>1.2k</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <SymbolView name={{ ios: 'bubble.right.fill', android: 'chat_bubble' }} size={30} tintColor="white" />
                    </View>
                    <Text style={styles.actionText}>400</Text>
                </Pressable>

                <Pressable style={styles.actionButton}>
                    <View style={styles.iconContainer}>
                        <SymbolView name={{ ios: 'arrowshape.turn.up.right.fill', android: 'reply' }} size={30} tintColor="white" />
                    </View>
                    <Text style={styles.actionText}>Share</Text>
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
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '600',
        marginTop: 6,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
