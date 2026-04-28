import { Ionicons } from "@expo/vector-icons";
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
      <StatusBar 
        barStyle={Colors.background === "#07090F" ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: Colors.background },
        ]}
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
        <Text style={styles.headerTitle}>السياسات الرسمية</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Text style={styles.updateDate}>آخر تحديث: 7 أبريل 2026</Text>
          <Text style={styles.appName}>تطبيق: مفاتيح حفظ القرآن</Text>
          <Text style={styles.developerName}>
            المطور: مصطفى أحمد (Mustafa Ahmad)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>١. مقدمة وهوية التطبيق</Text>
          <Text style={styles.paragraph}>
            تطبيق &quot;مفاتيح حفظ القرآن&quot; هو تطبيق مجاني (Free App) مخصص لمساعدة المسلمين
            على تنظيم حفظ ومراجعة القرآن الكريم. يُقدم هذا التطبيق كخدمة مجانية
            تهدف لنفع المستخدمين دون مقابل مادي وبأعلى معايير الخصوصية.
          </Text>
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>٢. جمع البيانات واستخدامها</Text>
          <Text style={styles.paragraph}>
            نحن نؤمن بالشفافية المطلقة مع مستخدمينا بشأن البيانات التقنية:
          </Text>
          <BulletPoint text="بيانات يقدمها المستخدم: لا نطلب منك أي بيانات شخصية (اسم، هاتف، أو حسابات) لاستخدام التطبيق. كل ما تدخله من خطط حفظ يُخزن محلياً فقط." />
          <BulletPoint text="بيانات تُجمع تلقائياً: لتحسين أداء التطبيق، قد يتم جمع معلومات تقنية بسيطة عبر خدمات طرف ثالث (Google Play Services) مثل: نوع الجهاز، إصدار نظام التشغيل، ومعرّفات الأجهزة الفريدة (Device ID) لأغراض تقنية بحتة." />
          <BulletPoint text="الأذونات الحساسة: لا يطلب التطبيق الوصول للكاميرا أو الصور أو جهات الاتصال. الأذونات المطلوبة هي (الإشعارات والاهتزاز) لتعزيز تجربة الاستخدام فقط." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٣. خدمات الطرف الثالث (Third-Party Services)
          </Text>
          <Text style={styles.paragraph}>
            يستخدم التطبيق خدمات تابعة لأطراف ثالثة لضمان استقرار العمل، ويمكنك
            مراجعة سياساتهم عبر الروابط التالية:
          </Text>
          <BulletPoint text="Google Play Services: لتشغيل التطبيق على أندرويد." />
          <BulletPoint text="Expo SDK: لتوفير ميزات النظام مثل الاهتزاز والإشعارات." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٤. حماية بيانات الأطفال (COPPA)
          </Text>
          <Text style={styles.paragraph}>
            تطبيق &quot;مفاتيح حفظ القرآن&quot; موجه لجميع الفئات العمرية بما في ذلك الأطفال
            دون سن ١٣ عاماً. نحن نلتزم بقانون حماية خصوصية الأطفال عبر الإنترنت
            (COPPA)؛ وبناءً عليه: لا نقوم بجمع أي معلومات تعريفية عن الأطفال،
            ولا يحتوي التطبيق على إعلانات مستهدفة أو محتوى غير لائق.
          </Text>
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٥. حذف البيانات (Data Deletion)
          </Text>
          <Text style={styles.paragraph}>
            بما أن جميع بياناتك مخزنة &quot;محلياً&quot; على جهازك:
          </Text>
          <BulletPoint text="يمكنك حذف كافة بياناتك فوراً عبر مسح ذاكرة التطبيق (Clear Data) من إعدادات جهازك." />
          <BulletPoint text="عند حذف التطبيق من جهازك، يتم مسح كافة السجلات وعمليات الحفظ تلقائياً ولا تتبقى لنا أي نسخة منها." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>٦. شروط الخدمة والملكية</Text>
          <BulletPoint text="حقوق الملكية: جميع أكواد وتصاميم التطبيق هي ملك للمطور. نصوص القرآن الكريم مستمدة من مصادر موثوقة (مجمع الملك فهد)." />
          <BulletPoint text="التعديلات: قد نقوم بتحديث هذه السياسة دورياً لمواكبة متطلبات المتاجر الرسمية. استمرارك في استخدام التطبيق يعتبر موافقة على النسخة الأحدث." />
        </View>

        <View
          style={[
            styles.card,
            { marginTop: Spacing.xl, marginBottom: Spacing["5xl"] },
          ]}
        >
          <Text style={styles.sectionTitle}>٧. التواصل الرسمي</Text>
          <Text style={styles.paragraph}>
            للأسئلة أو الاستفسارات القانونية، يرجى مراسلة المطور عبر البريد
            الإلكتروني الرسمي:
          </Text>
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
      fontFamily: Typography.heading,
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
    infoCard: {
      backgroundColor: Colors.primarySubtle,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: `${Colors.primary}15`,
    },
    updateDate: {
      fontFamily: Typography.heading,
      fontSize: 10,
      color: Colors.primary,
      opacity: 0.8,
      textAlign: "left",
    },
    appName: {
      fontFamily: Typography.heading,
      fontSize: 18,
      fontWeight: "bold",
      color: Colors.textPrimary,
      marginTop: 4,
      textAlign: "left",
    },
    developerName: {
      fontFamily: Typography.body,
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 2,
      textAlign: "left",
    },
    card: {
      backgroundColor: Colors.glass,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    sectionTitle: {
      fontFamily: Typography.heading,
      fontSize: Typography.base,
      fontWeight: Typography.bold,
      color: Colors.primary,
      marginBottom: Spacing.md,
      textAlign: "left",
    },
    paragraph: {
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      color: Colors.textPrimary,
      lineHeight: Typography.sm * 1.6,
      textAlign: "left",
      marginBottom: Spacing.sm,
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
      fontFamily: Typography.body,
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
      fontFamily: Typography.body,
      fontSize: Typography.sm,
      fontWeight: Typography.medium,
    },
  });
