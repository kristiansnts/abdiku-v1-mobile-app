import Constants from 'expo-constants';

/**
 * Feature flags based on app execution context
 * 
 * Expo Go has limitations and doesn't support certain native features.
 * Development builds and production builds have full feature support.
 */

/**
 * Check if the app is running in Expo Go
 * Expo Go is identified by the executionEnvironment being 'storeClient'
 */
export const isExpoGo = Constants.executionEnvironment === 'storeClient';

/**
 * Check if the app is a development build or production build
 * These builds have full native module support
 */
export const isStandaloneBuild = !isExpoGo;

/**
 * Feature Flags
 */
export const FEATURES = {
    /**
     * Push Notifications
     * Disabled in Expo Go (SDK 53+), enabled in dev/production builds
     */
    PUSH_NOTIFICATIONS: isStandaloneBuild,

    /**
     * Add more feature flags here as needed
     */
} as const;

/**
 * Log the current execution environment for debugging
 */
if (__DEV__) {
    console.log('🚀 Execution Environment:', {
        isExpoGo,
        isStandaloneBuild,
        executionEnvironment: Constants.executionEnvironment,
        features: FEATURES,
    });
}
