import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOutUp
} from 'react-native-reanimated';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type = 'success',
    onHide,
    duration = 3000
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onHide();
        }, duration);
        return () => clearTimeout(timer);
    }, []);

    const getIcon = () => {
        switch (type) {
            case 'success': return 'checkmark-circle';
            case 'error': return 'alert-circle';
            case 'info': return 'information-circle';
            default: return 'checkmark-circle';
        }
    };

    const getColor = () => {
        switch (type) {
            case 'success': return THEME.success;
            case 'error': return THEME.danger;
            case 'info': return THEME.primary;
            default: return THEME.success;
        }
    };

    return (
        <Animated.View
            entering={FadeInUp.springify()}
            exiting={FadeOutUp}
            style={[styles.container, styles[type]]}
        >
            <Ionicons name={getIcon() as any} size={20} color={getColor()} />
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 1,
    },
    success: {
        borderColor: '#dcfce7',
        backgroundColor: '#f0fdf4',
    },
    error: {
        borderColor: '#fee2e2',
        backgroundColor: '#fef2f2',
    },
    info: {
        borderColor: '#e0e7ff',
        backgroundColor: '#eef2ff',
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        flex: 1,
    },
});
