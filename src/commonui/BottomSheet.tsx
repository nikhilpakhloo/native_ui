import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export const BottomSheetContext = createContext<{
  expand: (content?: React.ReactNode) => void;
  close: () => void;
} | null>(null);

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (!context) throw new Error('useBottomSheet must be used within BottomSheetProvider');
  return context;
}

import { useColorTheme } from '@/hooks/useColorTheme';

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const { isDark, colors } = useColorTheme();
  const animatedIndex = useSharedValue(-1);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [content, setContent] = useState<React.ReactNode>(null);
  const isOpenRef = useRef(false);

  const handleSheetChanges = useCallback((index: number) => {
    isOpenRef.current = index >= 0;
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (isOpenRef.current) {
        bottomSheetRef.current?.dismiss();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const expand = useCallback((newContent?: React.ReactNode) => {
    if (newContent) setContent(newContent);
    bottomSheetRef.current?.present();
  }, []);

  const close = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const mainContentStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      animatedIndex.value,
      [-1, 1],
      [1, 0.94],
      Extrapolation.CLAMP
    );
    const borderRadius = interpolate(
      animatedIndex.value,
      [-1, 1],
      [0, 40],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      borderRadius,
      overflow: 'hidden',
    };
  });

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetContext.Provider value={{ expand, close }}>
        <BottomSheetModalProvider>
          <Animated.View style={[styles.main, mainContentStyle]}>
            {children}
          </Animated.View>

          <BottomSheetModal
            ref={bottomSheetRef}
            snapPoints={['50%', '80%']}
            enablePanDownToClose
            onChange={handleSheetChanges}
            animatedIndex={animatedIndex}
            handleIndicatorStyle={{ backgroundColor: colors.textSecondary as any, width: 40 }}
            backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.background as any }]}
          >
            <BottomSheetView style={styles.sheetContent}>
              {content || (
                <View style={styles.defaultContent}>
                  <Text style={[styles.title, { color: colors.text as any }]}>Bottom Sheet</Text>
                </View>
              )}
            </BottomSheetView>
          </BottomSheetModal>
        </BottomSheetModalProvider>
      </BottomSheetContext.Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000"
  },
  main: {
    flex: 1,
    backgroundColor: '#000',
  },
  sheetBackground: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContent: {
    flex: 1,
  },
  defaultContent: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
});
