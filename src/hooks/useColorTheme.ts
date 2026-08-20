import { isIOS } from '@/utils/platform';
import { Color } from 'expo-router';
import { useColorScheme } from 'react-native';

export function useColorTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isLight = !isDark;

  const colors = {
    background: isIOS ? Color.ios.secondarySystemBackground : (isDark ? "#151414ff" : Color.android.background_light),
    text: isIOS ? Color.ios.label : (isDark ? Color.android.white : Color.android.black),
    textSecondary: isIOS ? Color.ios.secondaryLabel : Color.android.darker_gray,
    border: isIOS ? Color.ios.separator : Color.android.darker_gray,
    red: isIOS ? Color.ios.systemRed : Color.android.holo_red_dark,
    black: isIOS ? Color.ios.darkText : Color.android.black,
  };

  return {
    colorScheme,
    isDark,
    isLight,
    colors,
  };
}
