import {
  Color,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { BottomSheetProvider } from "../commonui/BottomSheet";

import { useColorTheme } from "@/hooks/useColorTheme";

export default function RootLayout() {
  const { isDark, colors } = useColorTheme();
  const theme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      background: isDark
        ? Platform.OS === "android"
          ? Color.android.background_dark
          : Color.ios.tertiarySystemBackground
        : DefaultTheme.colors.background,
    },
  };
  return (
    <ThemeProvider value={theme}>
      <BottomSheetProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
          />
        </Stack>
      </BottomSheetProvider>
    </ThemeProvider>
  );
}