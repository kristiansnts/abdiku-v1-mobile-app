import { THEME } from '@/constants/theme';
import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    background: {
        flex: 1,
    },
    inner: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 30,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#1e293b',
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: THEME.muted,
        marginTop: 8,
        fontWeight: '500',
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        height: 60,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: THEME.text,
        fontWeight: '600',
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: THEME.text,
        fontWeight: '600',
    },
    eyeButton: {
        padding: 8,
    },
    button: {
        borderRadius: 20,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        flexDirection: 'row',
        overflow: 'hidden',
        shadowColor: THEME.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonGradient: {
        ...StyleSheet.absoluteFillObject,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
    },
    versionText: {
        fontSize: 12,
        color: THEME.mutedLight,
        fontWeight: '500',
    },
});
