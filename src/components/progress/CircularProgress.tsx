import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Circle, Svg } from "react-native-svg";
import { Typography } from "../../theme";

const STROKE_WIDTH = 12;

interface CircularProgressProps {
  percentage: number;
  color: string;
  size: number;
  Colors: any;
  label?: string;
}

export const CircularProgress = ({
  percentage,
  color,
  size,
  Colors,
  label = "إتمام الحفظ",
}: CircularProgressProps) => {
  const pct = Math.max(0, Math.min(1, percentage));
  const radius = (size - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct);
  const innerSize = size - STROKE_WIDTH * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
        />
        {/* Progress Fill */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>

      {/* Center Background & Text */}
      <View
        style={{
          position: "absolute",
          width: innerSize + 2,
          height: innerSize + 2,
          borderRadius: (innerSize + 2) / 2,
          backgroundColor: Colors.surface,
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Text style={[styles.pctText, { color: Colors.textPrimary }]}>
          {Math.round(pct * 100)}%
        </Text>
        <Text style={[styles.label, { color: Colors.textSecondary }]}>
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pctText: {
    fontFamily: Typography.heading,
    fontSize: 32,
  },
  label: {
    fontFamily: Typography.body,
    fontSize: 12,
    marginTop: 2,
  },
});
