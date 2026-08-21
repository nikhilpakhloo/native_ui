import { useTabBar } from '@/commonui/TabBarContext';
import { useColorTheme } from '@/hooks/useColorTheme';
import { router, useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReelCard } from '../components/ReelCard';

const { height: windowHeight } = Dimensions.get('window');

const VIDEOS = Array.from({ length: 10 }).map((_, i) => ({
    videoUrl: i % 2 === 0
        ? 'https://assets.afcdn.com/video49/20210722/v_645516.m3u8'
        : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: `https://picsum.photos/seed/reel${i + 1}/400/800`
}));

export default function ReelsScreen() {
    const { colors } = useColorTheme();
    const isFocused = useIsFocused();
    const [isMuted, setIsMuted] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const { tabBarOffset } = useTabBar();
    const insets = useSafeAreaInsets();

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

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <View style={[styles.container, { backgroundColor: colors.black as any }]}>
            <Animated.FlatList
                data={VIDEOS}
                keyExtractor={(_, index) => `reel-${index}`}
                renderItem={({ item, index }) => (
                    <ReelCard
                        item={item}
                        isActive={isFocused && index === activeIndex}
                        isNearby={index === activeIndex}
                        isMuted={isMuted}
                        toggleMute={toggleMute}
                    />
                )}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToInterval={windowHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                initialNumToRender={2}
                maxToRenderPerBatch={3}
                windowSize={5}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            />

            <TouchableOpacity
                style={[styles.backButton, { top: insets.top + 10 }]}
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/');
                    }
                }}
            >
                <SymbolView name={{ ios: 'chevron.left', android: 'chevron_left' }} size={20} tintColor={colors.white as any} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        left: 16,
        zIndex: 10,
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    }
});
