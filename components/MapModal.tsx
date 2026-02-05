import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
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
    isMockLocation?: boolean;
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
    onRetryLocation,
    isMockLocation = false
}: MapModalProps) => {
    const { t } = useLocalization();
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
                            {isClockIn ? t.map.confirmClockIn : t.map.confirmClockOut}
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
                                            <Text style={styles.retryText}>{t.map.retryGps}</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <ActivityIndicator size="large" color={THEME.primary} />
                                        <Text style={styles.loadingText}>{t.map.gatheringLocation}</Text>
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
                        {/* Mock Location Warning */}
                        {isMockLocation && (
                            <View style={styles.mockWarningBanner}>
                                <Ionicons name="warning" size={20} color="#dc2626" />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.mockWarningTitle}>{t.map.mockLocationTitle}</Text>
                                    <Text style={styles.mockWarningText}>
                                        {t.map.mockLocationBanner}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={[styles.statusBadge, { backgroundColor: isInside === true ? '#ecfdf5' : isInside === false ? '#fef2f2' : '#f8fafc' }]}>
                            <Ionicons
                                name={isInside === true ? "checkmark-circle" : isInside === false ? "warning" : "sync-outline"}
                                size={16}
                                color={isInside === true ? THEME.success : isInside === false ? THEME.danger : THEME.muted}
                            />
                            <Text style={[styles.statusText, { color: isInside === true ? THEME.success : isInside === false ? THEME.danger : THEME.muted }]}>
                                {isInside === true ? `${t.map.matched}: ${nearestPlace}` : isInside === false ? t.map.outsideAttendanceArea : t.map.verifyingLocation}
                            </Text>
                        </View>
                        <Text style={styles.infoDesc}>
                            {isInside === true
                                ? t.map.locationVerified
                                : isInside === false
                                    ? t.map.outsideWarning
                                    : t.map.pleaseWait}
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
                            {isClockIn ? t.home.clockInNow : t.home.clockOutNow}
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
    mockWarningBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 10,
    },
    mockWarningTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 4,
    },
    mockWarningText: {
        fontSize: 13,
        color: '#991b1b',
        lineHeight: 18,
    },
});

export default MapModal;
