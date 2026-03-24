import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";

export default function LegalScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const BulletPoint = ({ text }: { text: string }) => (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الشروط والخصوصية</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>شروط الاستخدام</Text>
          <View style={styles.paragraphContainer}>
            <Text style={styles.paragraph}>
              مرحباً بكم في تطبيق "الحصون الخمسة". باستخدامه، فإنكم توافقون على
              الشروط التالية:
            </Text>
          </View>
          <BulletPoint text="التطبيق مخصص للاستخدام الشخصي وغير التجاري فقط لمساعدتكم في حفظ القرآن الكريم." />
          <BulletPoint text="يُمنع استخدام محتوى التطبيق أو برمجياته لأغراض تجارية دون إذن مسبق." />
          <BulletPoint text="نحن نسعى لتقديم أدق المعلومات، ولكننا لا نضمن خلو التطبيق من الأخطاء التقنية البسيطة." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>سياسة الخصوصية</Text>
          <View style={styles.paragraphContainer}>
            <Text style={styles.paragraph}>
              نحن نقدر خصوصيتكم ونلتزم بحمايتها:
            </Text>
          </View>
          <BulletPoint text="البيانات التي تدخلها (مثل الاسم والهدف اليومي) تُخزن محلياً على جهازك فقط لتقديم تجربة مخصصة." />
          <BulletPoint text="لا نقوم ببيع بياناتك الشخصية لأي طرف ثالث." />
          <BulletPoint text="في حال استخدام خدمات سحابية (مثل النسخ الاحتياطي مستقبلاً)، سنقوم بتشفير البيانات وضمان أمنها." />
          <BulletPoint text="نستخدم إحصائيات مجهولة الهوية لتحسين أداء التطبيق وتقديم ميزات أفضل." />
        </View>

        <View
          style={[
            styles.card,
            { marginTop: Spacing.xl, marginBottom: Spacing["3xl"] },
          ]}
        >
          <Text style={styles.sectionTitle}>التواصل معنا</Text>
          <View style={styles.paragraphContainer}>
            <Text style={styles.paragraph}>
              إذا كان لديكم أي استفسار حول هذه السياسات، يمكنكم التواصل معنا عبر
              البريد الإلكتروني المخصص للدعم الفني.
            </Text>
          </View>
          <TouchableOpacity style={styles.contactBtn}>
            <Text style={styles.contactBtnText}>
              mustafa.ahmad.work@gmail.com
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: 56,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: Typography.lg,
      fontWeight: Typography.semibold,
      color: Colors.textPrimary,
    },
    backBtn: {
      width: 40,
      height: 40,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing["5xl"],
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    sectionTitle: {
      fontSize: Typography.base,
      fontWeight: Typography.bold,
      color: Colors.primary,
      marginBottom: Spacing.md,
      textAlign: "left",
    },
    paragraphContainer: {
      marginBottom: Spacing.md,
    },
    paragraph: {
      fontSize: Typography.sm,
      color: Colors.textPrimary,
      lineHeight: Typography.sm * 1.6,
      textAlign: "left",
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: Spacing.base,
      gap: Spacing.sm,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 8,
      backgroundColor: Colors.primary,
    },
    bulletText: {
      flex: 1,
      fontSize: Typography.sm,
      lineHeight: Typography.sm * 1.5,
      textAlign: "left",
      color: Colors.textSecondary,
    },
    contactBtn: {
      marginTop: Spacing.sm,
      paddingVertical: Spacing.sm,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.primaryMuted,
      borderRadius: BorderRadius.md,
      backgroundColor: Colors.primarySubtle,
    },
    contactBtnText: {
      color: Colors.primary,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
