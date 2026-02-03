import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LocationMapProps {
    latitude: number;
    longitude: number;
    locations?: Array<{
        latitude: number;
        longitude: number;
        name: string;
        geofence_radius_meters?: number;
    }>;
}

const LocationMap = ({ latitude, longitude, locations = [] }: LocationMapProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.placeholder}>
                <Text style={styles.text}>Google Maps is only available on iOS and Android devices.</Text>
                <Text style={styles.subtext}>Please use the mobile app for full attendance features.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 350,
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        backgroundColor: '#f8fafc',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
    },
});

export default LocationMap;
