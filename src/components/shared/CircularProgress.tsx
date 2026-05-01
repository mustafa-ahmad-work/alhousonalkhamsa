import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { useTheme, Colors, Typography } from '../../theme';

interface CircularProgressProps {
  percentage: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  style?: ViewStyle;
}

export function CircularProgress({
  percentage,
  size = 130,
  strokeWidth = 6,
  color = Colors.primary,
  label,
  sublabel,
  style,
}: CircularProgressProps) {
  const themeColors = useTheme();
  const styles = React.useMemo(() => getStyles(themeColors), [themeColors]);
  
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const pct = Math.round(percentage * 100);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background Ring */}
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: themeColors.border,
          },
        ]}
      />

      {/* Progress Ring (simulated with border) */}
      <View
        style={[
          styles.progressRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            opacity: percentage > 0 ? 1 : 0,
            transform: [{ rotate: `${-90 + 360 * percentage}deg` }],
          },
        ]}
      />

      {/* Center Content */}
      <View style={styles.center}>
        {label ? (
          <>
            <Text style={[styles.label, { color }]}>{label}</Text>
            {sublabel && (
              <Text style={styles.sublabel}>{sublabel}</Text>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.percentage, { color }]}>{pct}%</Text>
            <Text style={styles.sublabel}>مكتمل</Text>
          </>
        )}
      </View>
    </View>
  );
}

const getStyles = (Colors: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  ring: {
    position: 'absolute',
  },
  progressRing: {
    position: 'absolute',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  percentage: {
    fontFamily: Typography.heading, fontSize: Typography.xl,
  },
  label: {
    fontFamily: Typography.heading, fontSize: Typography.lg,
  },
  sublabel: {
    fontFamily: Typography.body, fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
