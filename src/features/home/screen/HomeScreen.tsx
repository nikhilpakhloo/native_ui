import { HomeHeader } from '@/commonui/Header';
import { useTabBar } from '@/commonui/TabBarContext';
import { useColorTheme } from '@/hooks/useColorTheme';
import { screenWidth } from '@/utils/dimensions';
import React, { useRef } from 'react';
import { StyleSheet, View, ViewToken } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { VideoCard } from '../components/VideoCard';

const ITEM_HEIGHT = (screenWidth * 9 / 16) + 15 + 12 + 60;
const HLS_URLS = [
    {
        id: "v3",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    {
        id: "v5",
        url: "https://assets.afcdn.com/video49/20210722/v_645516.m3u8"
    },
];

const DUMMY_DATA = Array.from({ length: 10 }).map((_, i) => {
    const source = HLS_URLS[i % HLS_URLS.length];
    return {
        id: `v${i + 1}`,
        videoId: source.id,
        title: `Video Item ${i + 1}`,
        videoUrl: source.url,
        channelName: `Channel ${i + 1}`,
        views: `${(Math.random() * 5).toFixed(1)}M views`,
        time: `${Math.floor(Math.random() * 10) + 1} days ago`,
        thumbnailUrl: `https://picsum.photos/seed/${i + 1}/600/400`
    };
});

export default function HomeScreen() {
    const { tabBarOffset } = useTabBar();
    const { colors } = useColorTheme();
    const bgColor = colors.background as any;

    const activeVideoIndexSV = useSharedValue(0);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const lastOffsetY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const currentOffsetY = event.contentOffset.y;
            const diff = currentOffsetY - lastOffsetY.value;

            if (currentOffsetY < 0) return;

            if (diff > 5) {
                if (tabBarOffset.value !== 100) {
                    // eslint-disable-next-line react-hooks/immutability
                    tabBarOffset.value = withTiming(100, { duration: 300 });
                }
            }
            else if (diff < -5) {
                if (tabBarOffset.value !== 0) {
                    // eslint-disable-next-line react-hooks/immutability
                    tabBarOffset.value = withTiming(0, { duration: 300 });
                }
            }

            lastOffsetY.value = currentOffsetY;
        },
    });

    const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index ?? 0;
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
            debounceTimeoutRef.current = setTimeout(() => {
                // eslint-disable-next-line react-hooks/immutability
                activeVideoIndexSV.value = newIndex;
            }, 300);
        }
    }, [activeVideoIndexSV]);

    const viewabilityConfig = React.useMemo(() => ({
        itemVisiblePercentThreshold: 50
    }), []);

    const renderItem = React.useCallback(({ item, index }: { item: any, index: number }) => {
        return <VideoCard item={item} index={index} activeVideoIndexSV={activeVideoIndexSV} />;
    }, [activeVideoIndexSV]);

    const getItemLayout = React.useCallback((_: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
    }), []);

    return (
        <View style={[styles.container, { backgroundColor: bgColor }]}>
            <HomeHeader />
            <Animated.FlatList
                data={DUMMY_DATA}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                getItemLayout={getItemLayout}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsVerticalScrollIndicator={false}
                windowSize={5}
                maxToRenderPerBatch={2}
                initialNumToRender={2}
                removeClippedSubviews={true}
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
    }
});
