import { THEME } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import LocationMap from './LocationMap';

interface MapModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    latitude: number | null;
    longitude: number | null;
    isInside: boolean | null;
    nearestPlace: string | null;
    actionType: 'clock-in' | 'clock-out' | null;
    locations: Array<{
        latitude: number;
        longitude: number;
        name: string;
        geofence_radius_meters?: number;
    }>;
    locationError?: string | null;
    onRetryLocation?: () => void;
}

const MapModal = ({
    visible,
    onClose,
    onConfirm,
    latitude,
    longitude,
    isInside,
    nearestPlace,
    actionType,
    locations,
    locationError,
    onRetryLocation
}: MapModalProps) => {
    const isClockIn = actionType === 'clock-in';

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {isClockIn ? 'Confirm Clock In' : 'Confirm Clock Out'}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={THEME.muted} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.mapContainer}>
                        {!latitude || !longitude ? (
                            <View style={styles.loadingContainer}>
                                {locationError ? (
                                    <>
                                        <Ionicons name="location-outline" size={40} color={THEME.danger} />
                                        <Text style={[styles.loadingText, { color: THEME.danger, textAlign: 'center' }]}>
                                            {locationError}
                                        </Text>
                                        <TouchableOpacity
                                            style={styles.retryButton}
                                            onPress={onRetryLocation}
                                        >
                                            <Text style={styles.retryText}>Retry GPS Search</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <ActivityIndicator size="large" color={THEME.primary} />
                                        <Text style={styles.loadingText}>Gathering location...</Text>
                                    </>
                                )}
                            </View>
                        ) : (
                            <LocationMap
                                latitude={latitude}
                                longitude={longitude}
                                locations={locations}
                            />
                        )}
                    </View>

                    <View style={styles.infoContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: isInside === true ? '#ecfdf5' : isInside === false ? '#fef2f2' : '#f8fafc' }]}>
                            <Ionicons
                                name={isInside === true ? "checkmark-circle" : isInside === false ? "warning" : "sync-outline"}
                                size={16}
                                color={isInside === true ? THEME.success : isInside === false ? THEME.danger : THEME.muted}
                            />
                            <Text style={[styles.statusText, { color: isInside === true ? THEME.success : isInside === false ? THEME.danger : THEME.muted }]}>
                                {isInside === true ? `Matched: ${nearestPlace}` : isInside === false ? 'Outside Attendance Area' : 'Verifying Location...'}
                            </Text>
                        </View>
                        <Text style={styles.infoDesc}>
                            {isInside === true
                                ? 'Your location has been verified. You can proceed with the attendance.'
                                : isInside === false
                                    ? 'Warning: You are currently outside the designated office area. This attendance might require HR approval.'
                                    : 'Please wait while we verify your current position...'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.confirmButton,
                            { backgroundColor: isClockIn ? THEME.primary : THEME.secondary }
                        ]}
                        onPress={onConfirm}
                    >
                        <Text style={styles.confirmButtonText}>
                            {isClockIn ? 'Clock In Now' : 'Clock Out Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.text,
    },
    closeButton: {
        padding: 4,
    },
    mapContainer: {
        marginBottom: 20,
    },
    loadingContainer: {
        height: 350,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 20,
    },
    loadingText: {
        marginTop: 12,
        color: THEME.muted,
    },
    infoContainer: {
        marginBottom: 24,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
    },
    infoDesc: {
        fontSize: 14,
        color: THEME.muted,
        lineHeight: 20,
    },
    confirmButton: {
        padding: 18,
        borderRadius: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retryButton: {
        marginTop: 20,
        backgroundColor: THEME.primary,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default MapModal;
