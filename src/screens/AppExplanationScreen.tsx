import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";

export default function AppExplanationScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const FortressCard = ({
    title,
    content,
    icon,
    color,
  }: {
    title: string;
    content: string | React.ReactNode;
    icon: string;
    color: string;
  }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconBox, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={22} color={color} />
        </View>
        <Text style={[styles.cardTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        {typeof content === "string" ? (
          <Text style={styles.paragraph}>{content}</Text>
        ) : (
          content
        )}
      </View>
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
        <Text style={styles.headerTitle}>شرح التطبيق</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons
              name="shield-checkmark"
              size={42}
              color={Colors.primary}
            />
          </View>
          <Text style={styles.mainTitle}>نظام الحصون الخمسة</Text>
          <Text style={styles.mainDescription}>
            نظام تراكمي يهدف لجعل حفظ القرآن الكريم راسخاً كحفظ سورة الفاتحة،
            يتطلب الهمة العالية والالتزام بالوقت للوصول للإتقان التام.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.presentationCard}
          onPress={() =>
            Linking.openURL(
              "https://drive.google.com/file/d/14qbC-np5qFv35H_FEofTCTnSyu1j4aap/view?usp=sharing",
            )
          }
        >
          <LinearGradient
            colors={[`${Colors.gold}20`, `${Colors.gold}05`]}
            style={styles.presentationGradient}
          >
            <View style={styles.presentationIconBox}>
              <Ionicons name="play" size={20} color={Colors.gold} />
            </View>
            <View style={styles.presentationInfo}>
              <Text style={styles.presentationTitle}>
                عرض تقديمي لطريقة الحصون
              </Text>
              <Text style={styles.presentationSubtitle}>
                شاهد الشرح الكامل للطريقة بشكل احترافي
              </Text>
            </View>
            <Ionicons
              name="open-outline"
              size={18}
              color={Colors.textTertiary}
            />
          </LinearGradient>
        </TouchableOpacity>

        <FortressCard
          title="الحصن الأول: الختمة (التلاوة والاستماع)"
          icon="book-outline"
          color={Colors.fortressRecitation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة التلاوة:</Text> قراءة جزئين
                يومياً (40 صفحة) بطريقة "الحدر"، بحيث لا يستغرق الجزء أكثر من 20
                دقيقة. الهدف هو ختم المصحف كل أسبوعين لتثبيت الحفظ بصرياً.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة الاستماع:</Text> الاستماع إلى
                حزب واحد يومياً (نصف جزء)، ويُفضل بصوت الشيخ الحصري لضبط مخارج
                الحروف.
              </Text>
            </View>
          }
        />

        <FortressCard
          title="الحصن الثاني: التحضير"
          icon="timer-outline"
          color={Colors.fortressPreparation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الأسبوعي:</Text> قراءة
                الصفحات التي ستحفظها في الأسبوع القادم يومياً طوال الأسبوع
                الحالي.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الليلي:</Text> قبل النوم
                لمدة 30 دقيقة؛ (15 دقيقة قراءة و15 دقيقة استماع) للصفحة المقررة
                غداً.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير القبلي:</Text> قبل البدء
                بالحفظ الفعلي بـ 15 دقيقة لتنشيط الذهن.
              </Text>
            </View>
          }
        />

        <FortressCard
          title="الحصن الثالث: الحفظ الجديد"
          icon="create-outline"
          color={Colors.fortressMemorization}
          content="تكرار الصفحة أو الصفحات الجديدة لمدة لا تقل عن 15 دقيقة. الالتزام بالوقت ضروري حتى لو شعرت بالحفظ السريع، لأن التكرار هو ما ينقل الحفظ للذاكرة البعيدة."
        />

        <FortressCard
          title="الحصن الرابع: مراجعة القريب"
          icon="sync-outline"
          color={Colors.fortressReview}
          content="تبدأ بعد حفظ أول 10-20 صفحة، وتتمثل في مراجعة آخر ما تم حفظه (بمقدار جزء تقريباً) يومياً قبل البدء في الحفظ الجديد لضمان عدم تفلته."
        />

        <FortressCard
          title="الحصن الخامس: مراجعة البعيد"
          icon="layers-outline"
          color={Colors.blue}
          content="تبدأ عند تجاوز حفظ جزئين فأكثر. للمتقدمين (من حفظوا 15 جزءاً مثلاً)، تكون مراجعة البعيد بمعدل جزئين يومياً."
        />

        <View style={styles.timeCard}>
          <LinearGradient
            colors={[`${Colors.primary}15`, `${Colors.primary}05`]}
            style={styles.timeGradient}
          >
            <View style={styles.timeInfo}>
              <Text style={styles.timeTitle}>إدارة الوقت اليومي</Text>
              <Text style={styles.timeText}>
                تحتاج هذه الخطة إلى حوالي ساعة إلى ساعة ونصف يومياً، موزعة على
                فترات (قبل النوم، عند الاستيقاظ، ووقت الحفظ).
              </Text>
            </View>
            <Ionicons name="alarm-outline" size={24} color={Colors.primary} />
          </LinearGradient>
        </View>

        {/* Developer Section */}
        <View style={styles.devCard}>
          <Image
            source={require("../../assets/images/moustafa.jpg")}
            style={styles.devImage}
          />
          <Text style={styles.devName}>م/ مصطفى أحمد</Text>
          <Text style={styles.devTitle}>مطور التطبيق</Text>

          <View style={styles.sadaqahContainer}>
            <Text style={styles.sadaqahText}>صدقة جارية</Text>
            <Text style={styles.duaText}>
              نسألكم الدعاء لي ولوالدي بظهر الغيب، وجزاكم الله خيراً.
            </Text>
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => Linking.openURL("https://www.facebook.com/")}
            >
              <Ionicons name="logo-facebook" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => Linking.openURL("https://wa.me/")}
            >
              <Ionicons name="logo-whatsapp" size={20} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={() => Linking.openURL("https://www.linkedin.com/")}
            >
              <Ionicons name="logo-linkedin" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
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
      textAlign: "center",
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
    scroll: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing["5xl"],
    },
    heroSection: {
      alignItems: "center",
      marginBottom: Spacing["2xl"],
      paddingHorizontal: Spacing.md,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: Colors.primaryMuted,
      borderWidth: 1,
      borderColor: `${Colors.primary}30`,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.lg,
    },
    mainTitle: {
      fontSize: Typography.xl,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      marginBottom: Spacing.sm,
      textAlign: "center",
    },
    mainDescription: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
      lineHeight: Typography.base * 1.6,
      textAlign: "center",
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.md,
      gap: Spacing.md,
    },
    cardIconBox: {
      width: 40,
      height: 40,
      borderRadius: BorderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      flex: 1,
      textAlign: "left",
    },
    cardBody: {
      paddingRight: 0,
    },
    paragraph: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
      lineHeight: Typography.base * 1.7,
      textAlign: "left",
    },
    subParagraph: {
      fontSize: Typography.base,
      color: Colors.textSecondary,
      lineHeight: Typography.base * 1.7,
      textAlign: "left",
      marginBottom: Spacing.xs,
    },
    bold: {
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
    },
    timeCard: {
      marginTop: Spacing.md,
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: `${Colors.primary}20`,
    },
    timeGradient: {
      flexDirection: "row-reverse",
      padding: Spacing.lg,
      alignItems: "center",
      gap: Spacing.lg,
    },
    timeInfo: {
      flex: 1,
    },
    timeTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: Colors.primary,
      marginBottom: Spacing.xs,
      textAlign: "left",
    },
    timeText: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      lineHeight: Typography.sm * 1.6,
      textAlign: "left",
    },
    presentationCard: {
      marginBottom: Spacing.xl,
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: `${Colors.gold}30`,
    },
    presentationGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.lg,
      gap: Spacing.md,
    },
    presentationIconBox: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: `${Colors.gold}15`,
      alignItems: "center",
      justifyContent: "center",
    },
    presentationInfo: {
      flex: 1,
    },
    presentationTitle: {
      fontSize: Typography.md,
      fontWeight: Typography.bold,
      color: Colors.gold,
      marginBottom: 2,
      textAlign: "left",
    },
    presentationSubtitle: {
      fontSize: Typography.sm,
      color: Colors.textSecondary,
      textAlign: "left",
    },
    devCard: {
      marginTop: Spacing.xl,
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.xl,
      padding: Spacing.xl,
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    devImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: Spacing.md,
      borderWidth: 3,
      borderColor: Colors.primary,
    },
    devName: {
      fontSize: Typography.base,
      fontWeight: Typography.bold,
      color: Colors.textPrimary,
      marginBottom: 2,
    },
    devTitle: {
      fontSize: Typography.sm,
      color: Colors.primary,
      fontWeight: Typography.medium,
      marginBottom: Spacing.lg,
    },
    sadaqahContainer: {
      alignItems: "center",
      backgroundColor: Colors.primarySubtle,
      padding: Spacing.md,
      borderRadius: BorderRadius.lg,
      marginBottom: Spacing.xl,
      width: "100%",
    },
    sadaqahText: {
      fontSize: Typography.sm,
      fontWeight: Typography.bold,
      color: Colors.primary,
      marginBottom: 4,
    },
    duaText: {
      fontSize: Typography.xs,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 18,
    },
    socialRow: {
      flexDirection: "row",
      gap: Spacing.lg,
      alignItems: "center",
    },
    socialBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: Colors.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: Colors.border,
    },
  });
