import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/constants/theme';
import { RequestType } from '@/types/attendance';
import { TranslationKeys } from '@/constants/translations';

interface RequestTypeSelectorProps {
  t: TranslationKeys;
  onSelect: (type: RequestType) => void;
}

export const RequestTypeSelector: React.FC<RequestTypeSelectorProps> = ({ t, onSelect }) => {
  return (
    <View style={styles.typeSelectionContainer}>
      <Text style={styles.modalTitle}>{t.requests.selectType}</Text>

      <TouchableOpacity style={styles.typeCard} onPress={() => onSelect('LATE')}>
        <View style={[styles.typeIcon, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="time-outline" size={28} color="#f59e0b" />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.lateRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.lateDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => onSelect('CORRECTION')}>
        <View style={[styles.typeIcon, { backgroundColor: '#dbeafe' }]}>
          <Ionicons name="create-outline" size={28} color={THEME.primary} />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.correctionRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.correctionDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.typeCard} onPress={() => onSelect('MISSING')}>
        <View style={[styles.typeIcon, { backgroundColor: '#fce7f3' }]}>
          <Ionicons name="calendar-outline" size={28} color="#ec4899" />
        </View>
        <View style={styles.typeInfo}>
          <Text style={styles.typeTitle}>{t.requests.missingRequest}</Text>
          <Text style={styles.typeDesc}>{t.requests.missingDesc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  typeSelectionContainer: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
  },
  typeIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 2,
  },
  typeDesc: {
    fontSize: 13,
    color: THEME.muted,
  },
});
