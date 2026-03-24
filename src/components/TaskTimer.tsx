import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Vibration } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Spacing, BorderRadius } from '../theme';
import { formatTime } from '../utils/helpers';
import { LinearGradient } from 'expo-linear-gradient';

type TaskTimerProps = {
  initialSeconds: number;
  onFinish: () => void;
  onClose: () => void;
  title: string;
};

export function TaskTimer({ initialSeconds, onFinish, onClose, title }: TaskTimerProps) {
  const Colors = useTheme();
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
      Vibration.vibrate([0, 500, 200, 500]);
      onFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const toggle = () => setIsActive(!isActive);
  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
    setIsFinished(false);
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient 
        colors={['rgba(7, 9, 15, 0.95)', 'rgba(10, 15, 24, 0.98)']} 
        style={styles.container}
      >
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>
        
        <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }], borderColor: isActive ? Colors.primary : Colors.border }]}>
          <Text style={[styles.timeText, { color: isFinished ? Colors.success : Colors.textPrimary }]}>
            {formatTime(seconds)}
          </Text>
          <Text style={styles.remainingLabel}>المتبقي</Text>
        </Animated.View>

        <View style={styles.controls}>
          {!isFinished ? (
            <TouchableOpacity style={[styles.btn, { backgroundColor: isActive ? Colors.warning : Colors.primary }]} onPress={toggle}>
              <Ionicons name={isActive ? "pause" : "play"} size={24} color="#FFF" />
              <Text style={styles.btnText}>{isActive ? "إيقاف مؤقت" : "ابدأ الآن"}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.success }]} onPress={onClose}>
              <Ionicons name="checkmark-done" size={24} color="#FFF" />
              <Text style={styles.btnText}>إكمال الورد</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>إعادة ضبط</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {isActive ? "استمر في التركيز على وردك اليومي" : "اضغط ابدأ عندما تكون مستعداً"}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.xl,
    padding: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: '#FFF',
    marginBottom: Spacing["3xl"],
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing["4xl"],
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  timeText: {
    fontSize: 54,
    fontWeight: '300',
    fontFamily: 'monospace',
  },
  remainingLabel: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.4)',
    marginTop: -5,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  btn: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    gap: Spacing.md,
  },
  btnText: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: '#FFF',
  },
  resetBtn: {
    padding: Spacing.sm,
  },
  resetText: {
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  hint: {
    position: 'absolute',
    bottom: 80,
    fontSize: Typography.sm,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  }
});
