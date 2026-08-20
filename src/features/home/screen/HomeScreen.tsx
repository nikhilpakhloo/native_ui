import { HomeHeader } from '@/commonui/Header';
import { useTabBar } from '@/commonui/TabBarContext';
import { useColorTheme } from '@/hooks/useColorTheme';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View, ViewToken } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
const HLS_URLS = [
    {
        id: "v1",
        url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8"
    }
];

const DUMMY_DATA = Array.from({ length: 30 }).map((_, i) => {
    const source = HLS_URLS[i % HLS_URLS.length];
    return {
        id: i.toString(),
        videoId: source.id,
        title: `Video Item ${i + 1}`,
        videoUrl: source.url,
        channelName: `Channel ${i + 1}`,
        views: `${(Math.random() * 5).toFixed(1)}M views`,
        time: `${Math.floor(Math.random() * 10) + 1} days ago`,
        thumbnailUrl: `https://picsum.photos/seed/${i + 1}/600/400`
    };
});

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

const VideoCard = React.memo(({ item, isFocused, isNearby }: { item: any, isFocused: boolean, isNearby: boolean }) => {
    const { isDark, colors } = useColorTheme();
    const textColor = colors.text as any;
    const subtextColor = colors.textSecondary as any;

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

export default function HomeScreen() {
    const { tabBarOffset } = useTabBar();
    const { isDark, colors } = useColorTheme();
    const bgColor = colors.background as any;

    const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const lastOffsetY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentOffsetY = event.contentOffset.y;
            const diff = currentOffsetY - lastOffsetY.value;

            if (currentOffsetY < 0) return;

            if (diff > 5) {
                if (tabBarOffset.value !== 100) {
                    tabBarOffset.value = withTiming(100, { duration: 300 });
                }
            }
            else if (diff < -5) {
                if (tabBarOffset.value !== 0) {
                    tabBarOffset.value = withTiming(0, { duration: 300 });
                }
            }

            lastOffsetY.value = currentOffsetY;
        },
    });

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index ?? 0;
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            // Debounce for 300ms to prevent native player initialization spam while scrolling
            debounceTimeoutRef.current = setTimeout(() => {
                setActiveVideoIndex(newIndex);
            }, 300);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50
    }).current;

    const renderItem = React.useCallback(({ item, index }: { item: any, index: number }) => {
        const isFocused = activeVideoIndex === index;
        const isNearby = Math.abs(activeVideoIndex - index) <= 1;
        return <VideoCard item={item} isFocused={isFocused} isNearby={isNearby} />;
    }, [activeVideoIndex]);

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <HomeHeader />
            <Animated.FlatList
                data={DUMMY_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                extraData={activeVideoIndex}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsVerticalScrollIndicator={false}
                windowSize={5}
                maxToRenderPerBatch={2}
                initialNumToRender={2}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        paddingTop: 0,
        paddingBottom: 100,
    },
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
