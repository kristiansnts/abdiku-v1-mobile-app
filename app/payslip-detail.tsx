import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GLOBAL_STYLES, THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { getPayslipDetail, getPayslipDownloadUrl } from '@/services/payrollService';
import { Payslip } from '@/types/payroll';

export default function PayslipDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { t, locale } = useLocalization();
    const [payslip, setPayslip] = useState<Payslip | null>(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        if (!id) return;

        try {
            setDownloading(true);
            const token = await AsyncStorage.getItem('token');
            const downloadUrl = `${getPayslipDownloadUrl(Number(id))}?token=${token}`;

            await WebBrowser.openBrowserAsync(downloadUrl);
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert(t.common.error, t.errors.operationFailed);
        } finally {
            setDownloading(false);
        }
    };

    useEffect(() => {
        if (id) {
            const fetchDetail = async () => {
                const data = await getPayslipDetail(Number(id));
                setPayslip(data);
                setLoading(false);
            };
            fetchDetail();
        }
    }, [id]);

    const formatMonth = (month: number) => {
        const date = new Date(2000, month - 1, 1);
        return date.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US', { month: 'long' });
    };

    const formatCurrency = (amount: number) => {
        return `Rp ${amount.toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')}`;
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={THEME.primary} />
            </View>
        );
    }

    if (!payslip) {
        return (
            <View style={styles.center}>
                <Text>{t.payslip.noData}</Text>
            </View>
        );
    }

    const breakdown = payslip.attendance.breakdown;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={THEME.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t.payslip.title}</Text>
                <TouchableOpacity
                    onPress={handleDownload}
                    style={styles.downloadButton}
                    disabled={downloading}
                >
                    {downloading ? (
                        <ActivityIndicator size="small" color={THEME.primary} />
                    ) : (
                        <Ionicons name="download-outline" size={24} color={THEME.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Main Card */}
                <Animated.View entering={FadeInDown.delay(200)} style={[styles.mainCard, GLOBAL_STYLES.shadowLg]}>
                    <LinearGradient
                        colors={[THEME.primary, THEME.primaryDeep]}
                        style={styles.cardGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Text style={styles.periodLabel}>{payslip.period.month_name || formatMonth(payslip.period.month)} {payslip.period.year}</Text>
                        <Text style={styles.netPayLabel}>{t.payslip.netPay}</Text>
                        <Text style={styles.netPayAmount}>{formatCurrency(payslip.summary.net_amount)}</Text>

                        <View style={styles.cardFooter}>
                            <View style={styles.footerItem}>
                                <Text style={styles.footerLabel}>{t.payslip.attendanceSummary}</Text>
                                <Text style={styles.footerValue}>{payslip.attendance.payable_days}/{payslip.attendance.total_working_days} Days</Text>
                            </View>
                            <View style={styles.footerDivider} />
                            <View style={styles.footerItem}>
                                <Text style={styles.footerLabel}>{t.payslip.attendanceRate}</Text>
                                <Text style={styles.footerValue}>
                                    {payslip.attendance.total_working_days > 0
                                        ? Math.round((payslip.attendance.payable_days / payslip.attendance.total_working_days) * 100)
                                        : 0}%
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Employee Info Header */}
                <View style={styles.employeeTag}>
                    <View style={styles.employeeAvatar}>
                        <Text style={styles.employeeAvatarText}>{payslip.employee.name[0]}</Text>
                    </View>
                    <View>
                        <Text style={styles.employeeName}>{payslip.employee.name}</Text>
                        <Text style={styles.employeeId}>ID: {payslip.employee.id}</Text>
                    </View>
                </View>

                {/* Breakdown Sections */}
                <Animated.View entering={FadeInUp.delay(400)} style={styles.breakdownContainer}>

                    {/* Attendance Summary Grid */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                                <Ionicons name="calendar" size={18} color="#3b82f6" />
                            </View>
                            <Text style={styles.sectionTitle}>{t.payslip.attendanceSummary}</Text>
                        </View>
                        <View style={styles.attendanceGrid}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridValue}>{breakdown.hadir || 0}</Text>
                                <Text style={styles.gridLabel}>{t.payslip.breakdown.hadir}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={[styles.gridValue, { color: THEME.warning }]}>{breakdown.terlambat || 0}</Text>
                                <Text style={styles.gridLabel}>{t.payslip.breakdown.terlambat}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridValue}>{breakdown.cuti_dibayar || 0}</Text>
                                <Text style={styles.gridLabel}>{t.payslip.breakdown.cuti_dibayar}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={[styles.gridValue, { color: THEME.danger }]}>
                                    {Math.max(0, payslip.attendance.total_working_days - payslip.attendance.payable_days)}
                                </Text>
                                <Text style={styles.gridLabel}>{t.payslip.breakdown.absen}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Earnings */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                                <Ionicons name="trending-up" size={18} color={THEME.success} />
                            </View>
                            <Text style={styles.sectionTitle}>{t.payslip.earnings}</Text>
                        </View>
                        <View style={styles.sectionCard}>
                            <View style={styles.row}>
                                <View style={[styles.labelWithSub, { marginRight: 12 }]}>
                                    <Text style={styles.rowLabel}>{t.profile.baseSalary || 'Base Salary'}</Text>
                                    {payslip.salary.prorated_base_salary !== payslip.salary.base_salary && (
                                        <Text style={styles.rowSubLabel}>{t.payslip.basis}: {formatCurrency(payslip.salary.base_salary)}</Text>
                                    )}
                                </View>
                                <Text style={styles.rowValue}>{formatCurrency(payslip.earnings.salary)}</Text>
                            </View>

                            {payslip.salary.allowances.map((item, index) => (
                                <View key={`all-${index}`} style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <Text style={styles.rowLabel}>{item.name}</Text>
                                    </View>
                                    <Text style={styles.rowValue}>{formatCurrency(item.amount)}</Text>
                                </View>
                            ))}

                            {payslip.earnings.additions.map((item, index) => (
                                <View key={`add-${index}`} style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 12 }}>
                                        <Text style={styles.rowLabel}>{item.name}</Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: THEME.success }]}>+ {formatCurrency(item.amount)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Deductions */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(244, 63, 94, 0.1)' }]}>
                                <Ionicons name="trending-down" size={18} color={THEME.danger} />
                            </View>
                            <Text style={styles.sectionTitle}>{t.payslip.deductions}</Text>
                        </View>
                        <View style={styles.sectionCard}>
                            {payslip.deductions.map((item, index) => (
                                <View key={`ded-${index}`} style={styles.row}>
                                    <View style={styles.deductionLabelGroup}>
                                        <Text style={styles.rowLabel}>{item.name}</Text>
                                    </View>
                                    <Text style={[styles.rowValue, { color: THEME.danger }]}>- {formatCurrency(item.employee_amount)}</Text>
                                </View>
                            ))}
                            {payslip.deductions.length === 0 && (
                                <Text style={styles.emptyText}>No deductions</Text>
                            )}
                        </View>
                    </View>

                    {/* Summary Card */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                                <Ionicons name="calculator" size={18} color={THEME.primary} />
                            </View>
                            <Text style={styles.sectionTitle}>{t.payslip.summary}</Text>
                        </View>
                        <View style={styles.summaryCard}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>{t.payslip.grossPay}</Text>
                                <Text style={styles.summaryValue}>{formatCurrency(payslip.summary.gross_amount)}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>{t.payslip.deductions}</Text>
                                <Text style={[styles.summaryValue, { color: THEME.danger }]}>- {formatCurrency(payslip.summary.total_deductions)}</Text>
                            </View>
                            <View style={styles.summaryDivider} />
                            <View style={styles.summaryRow}>
                                <Text style={styles.totalLabel}>{t.payslip.netPay}</Text>
                                <Text style={styles.totalValue}>{formatCurrency(payslip.summary.net_amount)}</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: THEME.text,
        flex: 1,
        textAlign: 'center',
    },
    downloadButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 8,
    },
    mainCard: {
        borderRadius: 32,
        overflow: 'hidden',
        marginBottom: 32,
    },
    cardGradient: {
        padding: 32,
        alignItems: 'center',
    },
    periodLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    netPayLabel: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    netPayAmount: {
        color: 'white',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 32,
    },
    cardFooter: {
        flexDirection: 'row',
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 16,
    },
    footerItem: {
        flex: 1,
        alignItems: 'center',
    },
    footerLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    footerValue: {
        color: 'white',
        fontSize: 14,
        fontWeight: '800',
    },
    footerDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    breakdownContainer: {
        gap: 24,
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 4,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: THEME.text,
    },
    sectionCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        gap: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    rowLabel: {
        fontSize: 15,
        color: THEME.text,
        fontWeight: '600',
    },
    rowValue: {
        fontSize: 15,
        fontWeight: '700',
        color: THEME.text,
        textAlign: 'right',
        flexShrink: 0,
    },
    deductionLabelGroup: {
        flex: 1,
        gap: 2,
        marginRight: 12,
    },
    deductionSublabel: {
        fontSize: 11,
        color: THEME.muted,
        fontWeight: '500',
    },
    summaryCard: {
        backgroundColor: THEME.text,
        borderRadius: 24,
        padding: 24,
        gap: 16,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    summaryValue: {
        fontSize: 14,
        color: 'white',
        fontWeight: '700',
        flexShrink: 0,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    totalLabel: {
        fontSize: 16,
        color: 'white',
        fontWeight: '700',
        flex: 1,
        marginRight: 12,
    },
    totalValue: {
        fontSize: 20,
        color: 'white',
        fontWeight: '900',
        flexShrink: 0,
    },
    emptyText: {
        textAlign: 'center',
        color: THEME.muted,
        paddingVertical: 8,
    },
    employeeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    employeeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: THEME.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    employeeAvatarText: {
        color: 'white',
        fontSize: 20,
        fontWeight: '800',
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '700',
        color: THEME.text,
    },
    employeeId: {
        fontSize: 12,
        color: THEME.muted,
        fontWeight: '500',
    },
    attendanceGrid: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    gridItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    gridValue: {
        fontSize: 18,
        fontWeight: '800',
        color: THEME.text,
    },
    gridLabel: {
        fontSize: 10,
        color: THEME.muted,
        fontWeight: '600',
        textAlign: 'center',
    },
    labelWithSub: {
        flex: 1,
        gap: 2,
    },
    rowSubLabel: {
        fontSize: 11,
        color: THEME.muted,
        fontWeight: '500',
    },
});
