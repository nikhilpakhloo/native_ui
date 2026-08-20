import React, { createContext, useContext } from 'react';
import { makeMutable, SharedValue, withTiming } from 'react-native-reanimated';

interface TabBarContextProps {
  tabBarOffset: SharedValue<number>;
  hideTabBar: () => void;
  showTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextProps | null>(null);

export const TabBarProvider = ({ children }: { children: React.ReactNode }) => {
  // 100 represents the hidden state (translated down by 100px)
  // 0 represents the visible state
  const tabBarOffset = makeMutable(0);

  const hideTabBar = () => {
    'worklet';
    if (tabBarOffset.value === 100) return;
    tabBarOffset.value = withTiming(100, { duration: 300 });
  };

  const showTabBar = () => {
    'worklet';
    if (tabBarOffset.value === 0) return;
    tabBarOffset.value = withTiming(0, { duration: 300 });
  };

  return (
    <TabBarContext.Provider value={{ tabBarOffset, hideTabBar, showTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
};

