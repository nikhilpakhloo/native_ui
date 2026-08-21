import { useColorTheme } from '@/hooks/useColorTheme';
import { useVideoStore } from '@/store/videoStore';
import { router, useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SharedValue, useAnimatedReaction } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';

function ActiveVideoPlayer({ videoUrl, isFocused, thumbnailUrl }: { videoUrl: string, isFocused: boolean, thumbnailUrl: string }) {
    const { colors } = useColorTheme();
    const [isMuted, setIsMuted] = useState(true);

    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
        player.muted = true;
    });

    useEffect(() => {
        if (isFocused) {
            player.play();
        } else {
            player.pause();
        }
    }, [isFocused, player]);

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        player.muted = newMutedState;
    };

    return (
        <View style={styles.thumbnail}>
            <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                allowsPictureInPicture
                nativeControls={false}
                contentFit="cover"
            />
            {!isFocused && (
                <Image source={{ uri: thumbnailUrl }} style={StyleSheet.absoluteFill} />
            )}
            {isFocused && (
                <Pressable style={styles.muteButton} onPress={toggleMute}>
                    <SymbolView
                        name={isMuted ? { ios: 'speaker.slash.fill', android: 'volume_off' } : { ios: 'speaker.wave.2.fill', android: 'volume_up' }}
                        size={16}
                        tintColor={colors.white as any}
                    />
                </Pressable>
            )}
        </View>
    );
}

export const VideoCard = React.memo(({ item, index, activeVideoIndexSV }: { item: any, index: number, activeVideoIndexSV: SharedValue<number> }) => {
    const { colors } = useColorTheme();
    const { setActiveVideo, activeVideo } = useVideoStore();
    const textColor = colors.text as any;
    const subtextColor = colors.textSecondary as any;
    const isScreenFocused = useIsFocused();

    const [isFocused, setIsFocused] = useState(index === 0);
    const [isNearby, setIsNearby] = useState(index <= 1);

    const updateState = (focused: boolean, nearby: boolean) => {
        setIsFocused(focused);
        setIsNearby(nearby);
    };

    useAnimatedReaction(
        () => {
            const focused = activeVideoIndexSV.value === index;
            const nearby = Math.abs(activeVideoIndexSV.value - index) <= 1;
            return { focused, nearby };
        },
        (current, previous) => {
            if (!previous || current.focused !== previous.focused || current.nearby !== previous.nearby) {
                runOnJS(updateState)(current.focused, current.nearby);
            }
        },
        [index, activeVideoIndexSV]
    );

    const shouldPlayLocal = isFocused && isScreenFocused && !activeVideo;

    return (
        <Pressable style={styles.card} onPress={() => {
            setActiveVideo(item);
            router.push('/video-player');
        }}>
            {/* eslint-disable-next-line react-hooks/immutability */}
            <Pressable
                onLongPress={() => { activeVideoIndexSV.value = index; }}
                onPress={() => {
                    setActiveVideo(item);
                    router.push('/video-player');
                }}
            >
                {isNearby ? (
                    <ActiveVideoPlayer videoUrl={item.videoUrl} isFocused={shouldPlayLocal} thumbnailUrl={item.thumbnailUrl} />
                ) : (
                    <Image source={{ uri: item.thumbnailUrl }} style={[styles.thumbnail, { backgroundColor: colors.black as any }]} />
                )}
            </Pressable>

            <View style={styles.metaContainer}>
                <View style={styles.avatar}>
                    <SymbolView name={{ ios: 'person.crop.circle.fill', android: 'account_circle' }} size={40} tintColor={subtextColor} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>{item.title} - Amazing video showcasing the power of Expo video!</Text>
                    <Text style={[styles.cardSubtitle, { color: subtextColor }]}>
                        {item.channelName} • {item.views} • {item.time}
                    </Text>
                </View>

                <View style={styles.moreIcon}>
                    <SymbolView name={{ ios: 'ellipsis', android: 'more_vert' }} size={16} tintColor={textColor} />
                </View>
            </View>
        </Pressable>
    );
});

VideoCard.displayName = 'VideoCard';

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        width: '100%',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
    },
    muteButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    metaContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingHorizontal: 12,
        height: 60,
    },
    avatar: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 20,
    },
    cardSubtitle: {
        fontSize: 13,
        marginTop: 4,
    },
    moreIcon: {
        paddingLeft: 12,
        paddingTop: 4,
    }
});
