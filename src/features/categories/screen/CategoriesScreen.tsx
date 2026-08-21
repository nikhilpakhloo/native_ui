import { useColorTheme } from '@/hooks/useColorTheme';
import { useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: windowHeight } = Dimensions.get('window');

const VIDEOS = Array.from({ length: 10 }).map((_, i) => ({
    videoUrl: i % 2 === 0
        ? 'https://assets.afcdn.com/video49/20210722/v_645516.m3u8'
        : 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    thumbnailUrl: `https://picsum.photos/seed/reel${i + 1}/400/800`
}));

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

function ReelItem({
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

export default function CategoriesScreen() {
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
                    <ReelItem
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
