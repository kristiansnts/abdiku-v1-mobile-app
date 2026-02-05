import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GLOBAL_STYLES, THEME } from '@/constants/theme';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: 'small' | 'large';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = 'large',
}) => {
  const iconSize = size === 'large' ? 60 : 40;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown} style={[styles.content, size === 'large' && GLOBAL_STYLES.card]}>
        <Ionicons name={icon} size={iconSize} color={THEME.muted} />
        {title && <Text style={[styles.title, size === 'small' && styles.titleSmall]}>{title}</Text>}
        {description && <Text style={styles.description}>{description}</Text>}
        {actionLabel && onAction && (
          <TouchableOpacity style={styles.actionButton} onPress={onAction}>
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 20,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 16,
    marginTop: 15,
  },
  description: {
    fontSize: 16,
    color: THEME.muted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  actionButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: THEME.bg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionText: {
    color: THEME.danger,
    fontWeight: 'bold',
  },
});
