import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Modal, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RequestCard, RequestForm, RequestTypeSelector } from '@/components/requests';
import { THEME } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLocalization } from '@/context/LocalizationContext';
import { useRequests } from '@/hooks/useRequests';
import { requestsStyles as styles } from '@/styles/screens';

export default function RequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useLocalization();

  const {
    requests,
    attendanceList,
    loading,
    refreshing,
    refresh,
    showModal,
    setShowModal,
    form,
    dispatch,
    openCreateModal,
    handleSubmit,
    handleDelete,
  } = useRequests({ enabled: !!user?.employee });

  // Refresh data when screen comes into focus (e.g., from push notification)
  useFocusEffect(
    useCallback(() => {
      if (user?.employee) {
        refresh();
      }
    }, [user?.employee, refresh])
  );

  if (!user?.employee) {
    return (
      <View style={styles.center}>
        <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.bg }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.requests.title}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: THEME.muted }}>{t.common.loading}</Text>
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.View entering={FadeInDown} style={styles.emptyContent}>
            <Ionicons name="document-text-outline" size={60} color={THEME.muted} />
            <Text style={styles.emptyText}>{t.requests.noRequests}</Text>
          </Animated.View>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={({ item, index }) => (
            <RequestCard
              item={item}
              index={index}
              locale={locale}
              t={t}
              onDelete={(id) => handleDelete(id, t)}
              onPress={(id) => router.push(`/request-detail?id=${id}`)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={THEME.primary} />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Create Request Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancel}>{t.requests.cancel}</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{t.requests.newRequest}</Text>
            <View style={{ width: 60 }} />
          </View>

          {form.step === 'type' ? (
            <RequestTypeSelector
              t={t}
              onSelect={(type) => dispatch({ type: 'SET_REQUEST_TYPE', payload: type })}
            />
          ) : (
            <RequestForm
              form={form}
              attendanceList={attendanceList}
              locale={locale}
              t={t}
              onBack={() => dispatch({ type: 'SET_STEP', payload: 'type' })}
              onSelectAttendance={(att) => dispatch({ type: 'SET_ATTENDANCE', payload: att })}
              onSetDate={(date) => dispatch({ type: 'SET_DATE', payload: date })}
              onSetClockIn={(date) => dispatch({ type: 'SET_CLOCK_IN', payload: date })}
              onSetClockOut={(date) => dispatch({ type: 'SET_CLOCK_OUT', payload: date })}
              onSetReason={(reason) => dispatch({ type: 'SET_REASON', payload: reason })}
              onSetPicker={(picker) => dispatch({ type: 'SET_PICKER', payload: picker })}
              onSubmit={() => handleSubmit(t)}
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
