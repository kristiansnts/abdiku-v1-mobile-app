import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { getPayslips } from '@/services/payrollService';
import { Payslip } from '@/types/payroll';

export default function PayslipScreen() {
    const router = useRouter();
    const { t, locale } = useLocalization();
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPayslips = async () => {
        setLoading(true);
        const data = await getPayslips();
        setPayslips(data);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        const data = await getPayslips();
        setPayslips(data);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchPayslips();
    }, []);

    const formatMonth = (month: number) => {
        const date = new Date(2000, month - 1, 1);
        return date.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long' });
    };

    const renderItem = ({ item, index }: { item: Payslip; index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
            <TouchableOpacity
                style={[styles.payslipCard, GLOBAL_STYLES.shadowLg]}
                onPress={() => router.push({ pathname: '/payslip-detail', params: { id: item.id } })}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.periodContainer}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="calendar" size={20} color={THEME.primary} />
                        </View>
                        <View>
                            <Text style={styles.periodText}>{item.period.month_name || formatMonth(item.period.month)} {item.period.year}</Text>
                            <Text style={styles.subPeriodText}>
                                {item.period.period_start} - {item.period.period_end}
                            </Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardContent}>
                    <View style={styles.amountGroup}>
                        <Text style={styles.label}>{t.payslip.netPay}</Text>
                        <Text style={styles.amount}>
                            Rp {(item.summary?.net_amount ?? item.net_amount).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}
                        </Text>
                    </View>
                    <View style={styles.statsBadge}>
                        <Ionicons name="checkmark-circle" size={12} color={THEME.success} />
                        <Text style={styles.statsText}>
                            {item.attendance?.payable_days ?? item.attendance_count}/{item.attendance?.total_working_days ?? item.attendance_count} {t.payslip.daysWorked}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                    <Text style={styles.headerTitle}>{t.payslip.title}</Text>
                    <View style={styles.headerIconBadge}>
                        <Ionicons name="receipt" size={20} color={THEME.primary} />
                    </View>
                </View>
                <Text style={styles.headerSubtitle}>{t.payslip.selectPeriod}</Text>
            </View>

            <FlatList
                data={payslips}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color={THEME.mutedLight} />
                        <Text style={styles.emptyText}>{t.payslip.noData}</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: THEME.bg,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIconBadge: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: THEME.text,
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 16,
        color: THEME.muted,
        marginTop: 4,
        fontWeight: '500',
    },
    listContainer: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 40,
    },
    payslipCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    periodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    periodText: {
        fontSize: 18,
        fontWeight: '800',
        color: THEME.text,
    },
    subPeriodText: {
        fontSize: 12,
        color: THEME.muted,
        fontWeight: '500',
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    amountGroup: {
        gap: 4,
    },
    label: {
        fontSize: 13,
        color: THEME.muted,
        fontWeight: '600',
    },
    amount: {
        fontSize: 22,
        fontWeight: '900',
        color: THEME.text,
        letterSpacing: -0.5,
    },
    statsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    statsText: {
        fontSize: 12,
        color: THEME.success,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: THEME.muted,
        fontWeight: '500',
    },
});
