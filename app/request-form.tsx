import { RequestForm } from '@/components/requests/RequestForm';
import { THEME } from '@/constants/theme';
import { useLocalization } from '@/context/LocalizationContext';
import { useRequests } from '@/hooks/useRequests';
import { RequestType } from '@/types/attendance';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { locale, t } = useLocalization();
    const {
        form,
        attendanceList,
        dispatch,
        handleSubmit,
    } = useRequests({ enabled: true });

    // Initialize form with URL params
    useEffect(() => {
        const type = params.type as RequestType;
        if (type) {
            dispatch({ type: 'SET_REQUEST_TYPE', payload: type });
        }
    }, [params.type, dispatch]);

    // Pre-select attendance when list is loaded
    useEffect(() => {
        const attendanceId = params.attendanceId ? parseInt(params.attendanceId as string) : undefined;

        if (attendanceId && attendanceList.length > 0 && !form.selectedAttendance) {
            const attendance = attendanceList.find(att => att.id === attendanceId);
            if (attendance) {
                dispatch({ type: 'SET_ATTENDANCE', payload: attendance });
            }
        }
    }, [params.attendanceId, attendanceList, form.selectedAttendance, dispatch]);

    const handleBack = () => {
        router.back();
    };

    const handleFormSubmit = async () => {
        const success = await handleSubmit(t);
        if (success) {
            router.back();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.content}>
                <RequestForm
                    form={form}
                    attendanceList={attendanceList}
                    locale={locale}
                    t={t}
                    onBack={handleBack}
                    onSelectAttendance={(att) => dispatch({ type: 'SET_ATTENDANCE', payload: att })}
                    onSetDate={(date) => dispatch({ type: 'SET_DATE', payload: date })}
                    onSetClockIn={(date) => dispatch({ type: 'SET_CLOCK_IN', payload: date })}
                    onSetClockOut={(date) => dispatch({ type: 'SET_CLOCK_OUT', payload: date })}
                    onSetReason={(reason) => dispatch({ type: 'SET_REASON', payload: reason })}
                    onSetPicker={(picker) => dispatch({ type: 'SET_PICKER', payload: picker })}
                    onSubmit={handleFormSubmit}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.bg,
    },
    content: {
        flex: 1,
    },
});
