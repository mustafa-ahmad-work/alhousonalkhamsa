import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme, Shadow, Spacing, Typography, BorderRadius } from "../../theme";
import { KhumsAlert } from "../shared/CustomAlert";
import { UpdateInfo } from "../../store/UpdateService";

const { width } = Dimensions.get("window");

interface Props {
  type: 'disabled' | 'force_update' | 'optional_update';
  info: UpdateInfo;
  onDismiss?: () => void;
  onRefresh?: () => void;
}

export default function VersionOverlay({ type, info, onDismiss, onRefresh }: Props) {
  const Colors = useTheme();
  
  const isBlocking = type === 'disabled' || type === 'force_update';

  const handleUpdate = async () => {
    if (info.link) {
      try {
        const canOpen = await Linking.canOpenURL(info.link);
        if (canOpen) {
          await Linking.openURL(info.link);
        } else {
          KhumsAlert.alert("خطأ", "لا يمكن فتح رابط التحديث على جهازك.", [], "error");
        }
      } catch (err) {
        console.error("Error opening update link:", err);
        KhumsAlert.alert("خطأ", "حدث خطأ أثناء محاولة فتح الرابط.", [], "error");
      }
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View 
          style={[styles.content, { backgroundColor: Colors.surface, borderColor: Colors.borderLight }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${type === 'disabled' ? Colors.red : Colors.primary}15` }]}>
            <Ionicons 
              name={type === 'disabled' ? "construct-outline" : "rocket-outline"} 
              size={48} 
              color={type === 'disabled' ? Colors.red : Colors.primary} 
            />
          </View>

          <Text style={[styles.title, { color: Colors.textPrimary }]}>
            {type === 'disabled' ? "الصيانة الدورية" : 
             type === 'force_update' ? "تحديث إجباري هام" : "يتوفر إصدار جديد"}
          </Text>

          <Text style={[styles.message, { color: Colors.textSecondary }]}>
            {type === 'disabled' ? (info.disabledMessage || "التطبيق متوقف حالياً للصيانة.") : 
             type === 'force_update' ? "نعتذر، ولكن يجب تحديث التطبيق للاستمتاع بآخر المميزات وضمان أمان بياناتك." : 
             "هناك نسخة أحدث من التطبيق متوفرة بمميزات وتحسينات جديدة."}
          </Text>

          {info.changelog && (
            <View style={[styles.changelogBox, { backgroundColor: Colors.glass, borderColor: Colors.glassBorder }]}>
              <Text style={[styles.changelogTitle, { color: Colors.textTertiary }]}>ما الجديد:</Text>
              <Text style={[styles.changelogText, { color: Colors.textPrimary }]}>{info.changelog}</Text>
            </View>
          )}

          <View style={styles.actions}>
            {type === 'disabled' && onRefresh && (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: Colors.primary, ...Shadow.emerald }]}
                onPress={onRefresh}
              >
                <Text style={styles.primaryBtnText}>المحاولة مرة أخرى</Text>
              </TouchableOpacity>
            )}

            {type !== 'disabled' && (
              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: Colors.primary, ...Shadow.emerald }]}
                onPress={handleUpdate}
              >
                <Text style={styles.primaryBtnText}>تحديث الآن</Text>
              </TouchableOpacity>
            )}

            {!isBlocking && onDismiss && (
              <TouchableOpacity
                style={[styles.secondaryBtn, { borderColor: Colors.border }]}
                onPress={onDismiss}
              >
                <Text style={[styles.secondaryBtnText, { color: Colors.textTertiary }]}>تذكيري لاحقاً</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  content: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: "center",
    borderWidth: 1,
    ...Shadow.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.heading, fontSize: Typography.xl,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  message: {
    fontFamily: Typography.body, fontSize: Typography.sm,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  changelogBox: {
    width: "100%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  changelogTitle: {
    fontFamily: Typography.heading, fontSize: 10,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  changelogText: {
    fontFamily: Typography.body, fontSize: 12,
    lineHeight: 18,
  },
  actions: {
    width: "100%",
    gap: Spacing.md,
  },
  primaryBtn: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontFamily: Typography.heading, fontSize: Typography.base,
  },
  secondaryBtn: {
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontFamily: Typography.body, fontSize: Typography.sm,
  },
});
