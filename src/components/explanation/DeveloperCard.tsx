import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";

interface DeveloperCardProps {
  Colors: any;
}

export const DeveloperCard: React.FC<DeveloperCardProps> = ({ Colors }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.surfaceElevated, borderColor: Colors.border },
      ]}
    >
      <View style={styles.info}>
        <Text style={[styles.name, { color: Colors.textPrimary }]}>
          م/ مصطفى أحمد
        </Text>
        <Text style={[styles.desc, { color: Colors.textSecondary }]}>
          مطور برمجيات يهدف من خلال هذا العمل إلى تيسير ومساعدة المسلمين في حفظ
          كتاب الله تعالى وإتقانه باستخدام أحدث الوسائل التقنية.
        </Text>
        <View style={styles.socials}>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.glass }]}
            onPress={() =>
              Linking.openURL("https://www.facebook.com/Mostafa7Ahmad")
            }
          >
            <Ionicons name="logo-facebook" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.glass }]}
            onPress={() => Linking.openURL("https://wa.me/+201120354592")}
          >
            <Ionicons name="logo-whatsapp" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.glass }]}
            onPress={() =>
              Linking.openURL("https://www.linkedin.com/in/mustafa-ahmad-work")
            }
          >
            <Ionicons name="logo-linkedin" size={18} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: Colors.glass }]}
            onPress={() => Linking.openURL("https://t.me/+nTRukDn0mAc2Zjc8")}
          >
            <Ionicons name="paper-plane" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Typography.heading,
    fontSize: Typography.base,
    marginBottom: 4,
  },
  desc: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  socials: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  socialBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
});
