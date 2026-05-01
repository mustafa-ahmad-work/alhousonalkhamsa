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
        barStyle={
          Colors.background === "#07090F" ? "light-content" : "dark-content"
        }
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
          <Text style={styles.updateDate}>آخر تحديث: ١ مايو ٢٠٢٦</Text>
          <Text style={styles.appName}>تطبيق: مفاتيح حفظ القرآن</Text>
          <Text style={styles.developerName}>
            المطور: مصطفى أحمد (Mustafa Ahmad)
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>١. مقدمة وهدف السياسة</Text>
          <Text style={styles.paragraph}>
            تهدف هذه السياسة إلى توضيح كيفية تعامل تطبيق &quot;مفاتيح حفظ
            القرآن&quot; مع بياناتك. نحن ندرك رحلتك مع القرآن الكريم، لذا صممنا
            هذا التطبيق ليكون ملاذاً آمناً وخاصاً بالكامل، حيث لا تخرج بياناتك
            عن حدود جهازك الشخصي أبداً.
          </Text>
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٢. ضمانة &quot;صفر بيانات&quot; (Zero-Data Policy)
          </Text>
          <Text style={styles.paragraph}>
            نحن نلتزم بسياسة صارمة لعدم جمع البيانات. إليك ما لا نقوم بجمعه
            نهائياً:
          </Text>
          <BulletPoint text="الهوية الشخصية: لا نطلب الاسم، العمر، الجنس، أو أي وثائق تعريفية." />
          <BulletPoint text="الاتصال: لا نطلب البريد الإلكتروني، رقم الهاتف، أو حسابات التواصل الاجتماعي." />
          <BulletPoint text="الوصول للحسابات: لا يطلب التطبيق تسجيل الدخول عبر جوجل، فيسبوك، أو أي طرف ثالث." />
          <BulletPoint text="البيانات الحساسة: لا نطلب الوصول لرسائلك، سجل المكالمات، أو كلمات المرور الخاصة بك." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٣. أمن التخزين المحلي (On-Device Storage)
          </Text>
          <Text style={styles.paragraph}>
            كل ما تقوم بإدخاله من سجلات حفظ، مراجعة، ودرجات قوة الحفظ يتم تخزينه
            باستخدام تقنيات التخزين المحلي المؤمنة في نظام تشغيل جهازك.
          </Text>
          <BulletPoint text="التشفير: البيانات تُخزن في مساحة معزولة خاصة بالتطبيق (Sandbox) لا يمكن للتطبيقات الأخرى الوصول إليها." />
          <BulletPoint text="عدم المزامنة السحابية: لا يملك المطور أي خوادم لاستقبال بياناتك، مما يعني أن بياناتك لا ترحل عبر الإنترنت إلى أي مكان." />
          <BulletPoint text="النسخ الاحتياطي: إذا قمت بتفعيل النسخ الاحتياطي لنظام أندرويد (Google Backup)، فقد يتم تضمين بيانات التطبيق ضمن نسخة نظامك الخاصة بك وحدك تحت إشرافك." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٤. الأذونات المطلوبة (App Permissions)
          </Text>
          <Text style={styles.paragraph}>
            يطلب التطبيق حداً أدنى من الأذونات ليعمل بكفاءة:
          </Text>
          <BulletPoint text="الإشعارات (Notifications): لإرسال تنبيهات ورد الحفظ والمراجعة التي تضبطها بنفسك." />
          <BulletPoint text="الاهتزاز (Vibration): لتقديم استجابة لمسية عند التفاعل مع أزرار التطبيق." />
          <BulletPoint text="الإنترنت (Internet): يُستخدم فقط لتحميل الخطوط (Google Fonts) أو التأكد من وجود تحديثات للمتصفح الداخلي عند الضرورة التقنية." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٥. الإفصاح عن الأطراف الثالثة التقنية
          </Text>
          <Text style={styles.paragraph}>
            لتقديم خدمة مستقرة، يعتمد التطبيق على بنية تحتية تقنية عالمية:
          </Text>
          <BulletPoint text="Google Play Services: تُستخدم لتوزيع التطبيق والتأكد من سلامته التقنية على أجهزة أندرويد." />
          <BulletPoint text="Expo SDK: هي البيئة البرمجية التي بُني عليها التطبيق لضمان عمله على مختلف إصدارات الهواتف." />
          <Text style={styles.paragraph}>
            هذه الجهات قد تجمع معلومات تقنية عامة (غير شخصية) مثل إصدار النظام
            أو نوع الهاتف لتحسين استقرار النظام البرمجي.
          </Text>
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>
            ٦. التزامات قانونية (GDPR & COPPA)
          </Text>
          <BulletPoint text="حقوق المستخدم (GDPR): لك الحق الكامل في حذف كافة بياناتك بضغطة زر واحدة عبر مسح ذاكرة التطبيق." />
          <BulletPoint text="حماية الأطفال (COPPA): التطبيق مصمم ليكون آمناً ١٠٠٪ للأطفال؛ لا إعلانات، لا تعقب، ولا محتوى غير لائق." />
          <BulletPoint text="عدم البيع: نلتزم بعدم بيع أو تأجير أي معلومات تقنية قد تتوفر لدينا لأي جهة إعلانية أو تجارية." />
        </View>

        <View style={[styles.card, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>٧. الاحتفاظ بالبيانات وحذفها</Text>
          <Text style={styles.paragraph}>
            نحن لا نحتفظ ببياناتك لأننا لا نملكها أصلاً. بياناتك تبقى على جهازك
            طالما أن التطبيق مثبّت.
          </Text>
          <BulletPoint text="عند رغبتك في حذف البيانات: انتقل إلى إعدادات الهاتف > التطبيقات > مفاتيح حفظ القرآن > مسح البيانات." />
          <BulletPoint text="عند حذف التطبيق: يتم تدمير كافة سجلات الحفظ والمراجعة ولا يمكن استعادتها." />
        </View>

        <View
          style={[
            styles.card,
            { marginTop: Spacing.xl, marginBottom: Spacing["5xl"] },
          ]}
        >
          <Text style={styles.sectionTitle}>٨. التواصل والدعم القانوني</Text>
          <Text style={styles.paragraph}>
            إذا كان لديك أي تساؤل حول كيفية حماية خصوصيتك، فنحن نرحب بتواصلك
            المباشر مع المطور:
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
    },
  });
