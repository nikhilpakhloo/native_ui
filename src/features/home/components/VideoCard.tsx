import { useColorTheme } from '@/hooks/useColorTheme';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { runOnJS, SharedValue, useAnimatedReaction } from 'react-native-reanimated';

function ActiveVideoPlayer({ videoUrl, isFocused, thumbnailUrl }: { videoUrl: string, isFocused: boolean, thumbnailUrl: string }) {
    const player = useVideoPlayer(videoUrl, player => {
        player.loop = true;
    });

    useEffect(() => {
        if (isFocused) {
            player.play();
        } else {
            player.pause();
        }
    }, [isFocused]);

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
        </View>
    );
}

export const VideoCard = React.memo(({ item, index, activeVideoIndexSV }: { item: any, index: number, activeVideoIndexSV: SharedValue<number> }) => {
    const { isDark, colors } = useColorTheme();
    const textColor = colors.text as any;
    const subtextColor = colors.textSecondary as any;

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

    return (
        <View style={styles.card}>
            {isNearby ? (
                <ActiveVideoPlayer videoUrl={item.videoUrl} isFocused={isFocused} thumbnailUrl={item.thumbnailUrl} />
            ) : (
                <Image source={{ uri: item.thumbnailUrl }} style={[styles.thumbnail, { backgroundColor: colors.black as any }]} />
            )}

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
        </View>
    );
});

const styles = StyleSheet.create({
    card: {
        marginBottom: 15,
        width: '100%',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: 16 / 9,
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
