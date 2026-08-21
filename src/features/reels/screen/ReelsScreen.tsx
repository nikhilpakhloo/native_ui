import { useColorTheme } from '@/hooks/useColorTheme';
import { useIsFocused } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
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
            <FlatList
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
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
