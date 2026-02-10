import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

export interface DialogAction {
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

export interface CustomDialogProps {
    visible: boolean;
    title: string;
    message: string;
    actions: DialogAction[];
    onClose: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
}

export const CustomDialog: React.FC<CustomDialogProps> = ({
    visible,
    title,
    message,
    actions,
    onClose,
    icon,
    iconColor = THEME.primary,
}) => {
    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <Animated.View
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(200)}
                    style={styles.overlay}
                >
                    <TouchableWithoutFeedback>
                        <Animated.View
                            entering={FadeInDown.springify().damping(15)}
                            style={styles.container}
                        >
                            {icon && (
                                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
                                    <Ionicons name={icon} size={32} color={iconColor} />
                                </View>
                            )}
                            <Text style={styles.title}>{title}</Text>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.actions}>
                                {actions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.button,
                                            action.style === 'destructive' && styles.buttonDestructive,
                                            action.style === 'cancel' && styles.buttonCancel,
                                        ]}
                                        onPress={() => {
                                            action.onPress();
                                            onClose();
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.buttonText,
                                                action.style === 'destructive' && styles.buttonTextDestructive,
                                                action.style === 'cancel' && styles.buttonTextCancel,
                                            ]}
                                        >
                                            {action.text}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </Animated.View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        fontWeight: '500',
    },
    actions: {
        width: '100%',
        gap: 12,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        backgroundColor: THEME.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: '#f1f5f9',
    },
    buttonDestructive: {
        backgroundColor: '#fee2e2',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
    },
    buttonTextCancel: {
        color: '#64748b',
    },
    buttonTextDestructive: {
        color: THEME.danger,
    },
});
