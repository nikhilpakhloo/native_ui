import {
  Color,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetProvider } from "../commonui/BottomSheet";
import GlobalPlayerOverlay from "@/components/GlobalPlayerOverlay";

import { useColorTheme } from "@/hooks/useColorTheme";

export default function RootLayout() {
  const { isDark, colors } = useColorTheme();
  const theme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background as string,
    },
  };
  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <ThemeProvider value={theme}>
        <BottomSheetProvider>
          <Stack>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
          </Stack>
          <GlobalPlayerOverlay />
        </BottomSheetProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}