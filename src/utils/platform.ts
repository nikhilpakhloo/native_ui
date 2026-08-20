import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

/**
 * Helper to select values based on the current platform.
 */
export function platformSelect<T>(specifics: { ios?: T; android?: T; web?: T; default: T }): T {
    return Platform.select(specifics) as T;
}
