import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SelectCompanyScreen() {
    const { user, setCompany } = useAuth();
    const router = useRouter();
    const [selecting, setSelecting] = useState<number | null>(null);

    const handleSelect = async (companyId: number) => {
        setSelecting(companyId);
        try {
            await setCompany(companyId);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Failed to set company:', error);
        } finally {
            setSelecting(null);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelect(item.id)}
            disabled={selecting !== null}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="business" size={24} color={THEME.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.role}>{item.role.toUpperCase()}</Text>
            </View>
            {selecting === item.id ? (
                <ActivityIndicator color={THEME.primary} />
            ) : (
                <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: 'Pilih Perusahaan', headerShown: true }} />
            <View style={styles.header}>
                <Text style={styles.title}>Selamat Datang!</Text>
                <Text style={styles.subtitle}>Pilih konteks perusahaan untuk memulai sesi Anda.</Text>
            </View>

            <FlatList
                data={user?.companies || []}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { padding: 24, marginBottom: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: THEME.text },
    subtitle: { fontSize: 16, color: THEME.muted, marginTop: 8 },
    list: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: THEME.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    info: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: THEME.text },
    role: { fontSize: 12, color: THEME.primary, fontWeight: '600', marginTop: 2 },
});
