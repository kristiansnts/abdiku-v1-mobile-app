import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { createLeaveRequest, getLeaveBalances, getLeaveTypes, LeaveType, LeaveBalance } from '@/services/leaveService';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    TextInput, 
    ScrollView, 
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LeaveFormScreen() {
    const router = useRouter();
    const { t } = useLocalization();
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [reason, setReason] = useState('');
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [types, currentBalances] = await Promise.all([
                getLeaveTypes(),
                getLeaveBalances()
            ]);
            setLeaveTypes(types);
            setBalances(currentBalances);
            if (types.length > 0) setSelectedTypeId(types[0].id);
        } catch (error) {
            Alert.alert('Error', 'Gagal memuat data cuti');
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedTypeId) return;
        
        setLoading(true);
        try {
            await createLeaveRequest({
                leave_type_id: selectedTypeId,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                reason: reason
            });
            Alert.alert('Sukses', 'Pengajuan cuti berhasil dikirim', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal mengirim pengajuan';
            Alert.alert('Gagal', msg);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ 
                headerTitle: 'Pengajuan Cuti',
                headerShown: true,
                headerLeft: () => (
                    <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
                        <Ionicons name="arrow-back" size={24} color={THEME.text} />
                    </TouchableOpacity>
                )
            }} />
            
            <ScrollView style={styles.content} contentContainerStyle={{ padding: 20 }}>
                <View style={styles.section}>
                    <Text style={styles.label}>Jenis Cuti</Text>
                    <View style={styles.typeContainer}>
                        {leaveTypes.map((type) => {
                            const balance = balances.find(b => b.leave_type_id === type.id);
                            return (
                                <TouchableOpacity 
                                    key={type.id}
                                    style={[
                                        styles.typeCard,
                                        selectedTypeId === type.id && styles.typeCardActive
                                    ]}
                                    onPress={() => setSelectedTypeId(type.id)}
                                >
                                    <Text style={[
                                        styles.typeName,
                                        selectedTypeId === type.id && styles.textWhite
                                    ]}>{type.name}</Text>
                                    <Text style={[
                                        styles.typeBalance,
                                        selectedTypeId === type.id && styles.textWhite
                                    ]}>Sisa: {balance?.balance ?? 0} hari</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Tanggal Mulai</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={THEME.textLight} />
                        <Text style={styles.dateText}>{startDate.toDateString()}</Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            onChange={(event, date) => {
                                setShowStartPicker(false);
                                if (date) setStartDate(date);
                            }}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Tanggal Berakhir</Text>
                    <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndPicker(true)}>
                        <Ionicons name="calendar-outline" size={20} color={THEME.textLight} />
                        <Text style={styles.dateText}>{endDate.toDateString()}</Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            minimumDate={startDate}
                            onChange={(event, date) => {
                                setShowEndPicker(false);
                                if (date) setEndDate(date);
                            }}
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Alasan</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Berikan alasan pengajuan cuti..."
                        multiline
                        numberOfLines={4}
                        value={reason}
                        onChangeText={setReason}
                    />
                </View>

                <TouchableOpacity 
                    style={[styles.submitButton, loading && styles.disabled]} 
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Kirim Pengajuan</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { flex: 1 },
    section: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: THEME.textLight, marginBottom: 8 },
    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    typeCard: { 
        padding: 12, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: THEME.border, 
        backgroundColor: '#fff',
        minWidth: '45%'
    },
    typeCardActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
    typeName: { fontSize: 14, fontWeight: 'bold', color: THEME.text },
    typeBalance: { fontSize: 12, color: THEME.textLight, marginTop: 2 },
    dateInput: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 12, 
        borderWidth: 1, 
        borderColor: THEME.border, 
        borderRadius: 10, 
        gap: 10 
    },
    dateText: { fontSize: 16, color: THEME.text },
    textArea: { 
        borderWidth: 1, 
        borderColor: THEME.border, 
        borderRadius: 10, 
        padding: 12, 
        height: 100, 
        textAlignVertical: 'top' 
    },
    submitButton: { 
        backgroundColor: THEME.primary, 
        padding: 16, 
        borderRadius: 12, 
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30
    },
    submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabled: { opacity: 0.7 },
    textWhite: { color: '#fff' }
});
