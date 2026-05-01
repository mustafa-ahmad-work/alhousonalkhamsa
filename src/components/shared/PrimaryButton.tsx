import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { useTheme, Typography, Spacing, BorderRadius, Shadow } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: PrimaryButtonProps) {
  const Colors = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  if (variant === 'primary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          style={styles.wrapper}
        >
          <View
            style={[
              styles.gradient,
              !disabled && Shadow.md,
              { backgroundColor: disabled ? Colors.surfaceElevated : Colors.primary }
            ]}
          >
            {icon && (
              <Ionicons
                name={icon as any}
                size={18}
                color={disabled ? Colors.textTertiary : '#FFFFFF'}
              />
            )}
            <Text style={[styles.label, disabled && { color: Colors.textTertiary }, textStyle]}>
              {label}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === 'secondary') {
    return (
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          style={[
            styles.secondary,
            { borderColor: Colors.primary + '40', backgroundColor: Colors.primaryMuted },
            disabled && styles.disabledSecondary,
          ]}
        >
          {icon && (
            <Ionicons
              name={icon as any}
              size={18}
              color={disabled ? Colors.textTertiary : Colors.primary}
            />
          )}
          <Text
            style={[
              styles.secondaryLabel,
              { color: Colors.primary },
              disabled && { color: Colors.textTertiary },
              textStyle,
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Ghost
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[styles.ghost, style]}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={18}
          color={disabled ? Colors.textTertiary : Colors.textSecondary}
        />
      )}
      <Text style={[styles.ghostLabel, { color: Colors.textSecondary }, disabled && { color: Colors.textTertiary }, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  label: {
    fontFamily: Typography.heading, fontSize: Typography.base,
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // Secondary
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  disabledSecondary: {
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  secondaryLabel: {
    fontFamily: Typography.body, fontSize: Typography.base,
    textAlign: 'center',
  },

  // Ghost
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  ghostLabel: {
    fontFamily: Typography.body, fontSize: Typography.base,
    textAlign: 'center',
  },
});
