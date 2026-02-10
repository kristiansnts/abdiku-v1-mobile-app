/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Design tokens from docs
export const THEME = {
  primary: '#1e3a8a', // Deep blue from logo text
  primaryDeep: '#1e40af', // Deeper blue for gradients
  primaryLight: '#3b82f6', // Light blue
  secondary: '#ec4899', // Pink for secondary actions
  accent: '#2BC49F', // Cyan from logo
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  success: '#10b981',
  danger: '#f43f5e',
  warning: '#f59e0b',
  muted: '#64748b',
  mutedLight: '#94a3b8',
  border: '#e2e8f0',
};

export const GLOBAL_STYLES = {
  card: {
    backgroundColor: THEME.card,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  shadowLg: {
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  }
};

const tintColorLight = THEME.primary;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: THEME.text,
    background: THEME.bg,
    tint: tintColorLight,
    icon: THEME.muted,
    tabIconDefault: THEME.muted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
