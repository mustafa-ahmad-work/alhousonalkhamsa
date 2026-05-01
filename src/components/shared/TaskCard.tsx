import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";
import { TaskSelection } from "../../types";
import { RangeChip } from "./RangeChip";

interface TaskCardProps {
  task: TaskSelection;
  moduleColor: string;
  isListeningModule: boolean;
  onRemove: (id: string) => void;
  onComplete: (task: TaskSelection) => void;
  onStartSession: (task: TaskSelection) => void;
  Colors: any;
}

export function TaskCard({
  task,
  moduleColor,
  isListeningModule,
  onRemove,
  onRemoveRange,
  onComplete,
  onStartSession,
  Colors,
}: TaskCardProps & {
  onRemoveRange?: (taskId: string, rangeId: string) => void;
}) {
  return (
    <View
      style={[
        styles.taskCard,
        { backgroundColor: Colors.surface, borderColor: Colors.border },
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.timeTag}>
          <Ionicons
            name="calendar-outline"
            size={12}
            color={Colors.textTertiary}
          />
          <Text style={styles.taskDate}>
            {new Date(task.createdAt).toLocaleDateString("ar-EG")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.deleteCircle}
          onPress={() => onRemove(task.id)}
        >
          <Ionicons name="trash-outline" size={14} color={Colors.red} />
        </TouchableOpacity>
      </View>

      <View style={styles.rangesContainer}>
        {task.ranges.map((r, i) => (
          <RangeChip
            key={i}
            range={r}
            onRemove={(rid) => onRemoveRange?.(task.id, rid)}
          />
        ))}
      </View>

      <View style={styles.actionsBox}>
        <TouchableOpacity
          style={[
            styles.startBtn,
            {
              backgroundColor: `${moduleColor}12`,
              borderColor: `${moduleColor}20`,
            },
          ]}
          onPress={() => onStartSession(task)}
        >
          <Ionicons
            name={isListeningModule ? "headset" : "play"}
            size={18}
            color={moduleColor}
          />
          <Text style={[styles.startBtnText, { color: moduleColor }]}>
            {isListeningModule ? "بدء الاستماع" : "بدء الجلسة"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.completeBtn,
            { backgroundColor: Colors.surfaceElevated },
          ]}
          onPress={() => onComplete(task)}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <Text
            style={[styles.completeBtnText, { color: Colors.textSecondary }]}
          >
            إتمام
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
    paddingBottom: Spacing.sm,
  },
  timeTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deleteCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(240, 112, 112, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  taskDate: {
    fontFamily: Typography.body,
    fontSize: 10,
    color: "#7A8394",
  },
  rangesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionsBox: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  completeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  completeBtnText: {
    fontFamily: Typography.heading,
    fontSize: 13,
  },
  startBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    borderWidth: 1,
  },
  startBtnText: {
    fontFamily: Typography.body,
    fontSize: 13,
  },
});
