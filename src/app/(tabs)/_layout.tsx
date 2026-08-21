import { TabBarProvider, useTabBar } from '@/commonui/TabBarContext';
import { useColorTheme } from '@/hooks/useColorTheme';
import { screenWidth } from '@/utils/dimensions';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabMeasurement = { x: number; width: number };

function CustomTabBar({ state, descriptors, navigation }: any) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { colors } = useColorTheme();
  const insets = useSafeAreaInsets();
  const { tabBarOffset } = useTabBar();

  const activeColor = colors.text;
  const inactiveColor = colors.textSecondary;
  const bgColor = colors.background;
  const borderColor = colors.border;

  const [tabMeasurements, setTabMeasurements] = useState<{ [key: string]: TabMeasurement }>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandingRef = useRef(false);

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    if (isExpanded && offsetX <= 5 && !isExpandingRef.current) {
      setIsExpanded(false);
    }
  };

  const onTabLayout = (key: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabMeasurements(prev => ({ ...prev, [key]: { x, width } }));
  };

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    const measurement = tabMeasurements[activeRoute.key];

    if (measurement && scrollViewRef.current) {
      const scrollX = measurement.x - (screenWidth / 2) + (measurement.width / 2);

      const safeScrollX = Math.max(0, scrollX);
      scrollViewRef.current.scrollTo({ x: safeScrollX, animated: true });
    }
  }, [state.index, tabMeasurements, screenWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarOffset.value }],
    };
  });

  return (
    <Animated.View style={[
      styles.tabBarContainer,
      {
        backgroundColor: bgColor,
        borderTopColor: borderColor,
        paddingBottom: insets.bottom,
      },
      animatedStyle
    ]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {(isExpanded ? state.routes : state.routes.slice(0, 4)).map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;
          const color = isFocused ? activeColor : inactiveColor;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={(e) => onTabLayout(route.key, e)}
              style={[styles.tabItem, { width: screenWidth / 5 }]}
              activeOpacity={0.7}
            >
              {options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color, size: 24 }) : null}
              <Text style={{ color, fontSize: 11, marginTop: 4, fontWeight: isFocused ? '600' : '400' }} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {!isExpanded && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => {
              isExpandingRef.current = true;
              setIsExpanded(true);
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
                setTimeout(() => {
                  isExpandingRef.current = false;
                }, 500);
              }, 100);
            }}
            style={[styles.tabItem, { width: screenWidth / 5 }]}
            activeOpacity={0.7}
          >
            <SymbolView name={{ ios: 'ellipsis', android: 'more_horiz' }} size={24} tintColor={inactiveColor} />
            <Text style={{ color: inactiveColor, fontSize: 11, marginTop: 4, fontWeight: '400' }} numberOfLines={1}>
              More
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function TabsContent() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'house.fill', android: 'home' }} size={24} tintColor={color} />,
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{
            title: 'Reel',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'play.rectangle.on.rectangle', android: 'video_library' }} size={24} tintColor={color} />,
          }}
        />
        <Tabs.Screen
          name="create"
          options={{
            title: 'Create',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'plus', android: 'add' }} size={24} tintColor={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'sparkle.magnifyingglass', android: 'search' }} size={24} tintColor={color} />,
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'books.vertical.fill', android: 'library_books' }} size={24} tintColor={color} />,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <SymbolView name={{ ios: 'gear', android: 'settings' }} size={24} tintColor={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

export default function TabLayout() {
  return (
    <TabBarProvider>
      <TabsContent />
    </TabBarProvider>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  scrollContent: {
    alignItems: 'center',
    height: 60,
  },
  tabItem: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
