import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { THEME } from '@/constants/theme';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'muted';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: THEME.success },
  danger: { bg: '#fef2f2', text: THEME.danger },
  warning: { bg: '#fef3c7', text: '#f59e0b' },
  info: { bg: '#dbeafe', text: THEME.primary },
  muted: { bg: '#f1f5f9', text: THEME.muted },
};

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'muted',
  size = 'medium',
  style,
  textStyle,
}) => {
  const colors = variantColors[variant];
  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        isSmall && styles.badgeSmall,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colors.text },
          isSmall && styles.textSmall,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 10,
  },
});
