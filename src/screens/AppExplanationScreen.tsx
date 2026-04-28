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
  ViewStyle,
  TextStyle,
} from "react-native";
import { DeveloperCard } from "../components/explanation/DeveloperCard";
import { ExplanationHero } from "../components/explanation/ExplanationHero";
import {
  PresentationCard,
  TimeManagementCard,
} from "../components/explanation/ExplanationSubCards";
import { ExplanationCard } from "../components/shared/ExplanationCard";
import { BorderRadius, Spacing, Typography, useTheme } from "../theme";

export default function AppExplanationScreen() {
  const Colors = useTheme();
  const styles = React.useMemo(() => getStyles(Colors), [Colors]);

  const SectionHeader = ({
    title,
    color,
  }: {
    title: string;
    color: string;
  }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={Colors.background === "#07090F" ? "light-content" : "dark-content"} 
        translucent 
        backgroundColor="transparent" 
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
        <ExplanationHero Colors={Colors} />
        <PresentationCard Colors={Colors} />

        <SectionHeader
          title="منهجية المفاتيح الخمسة بالتفصيل"
          color={Colors.primary}
        />
        <ExplanationCard
          title="المفتاح الأول: الختمة (التلاوة والاستماع)"
          icon="book-outline"
          color={Colors.fortressRecitation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة التلاوة:</Text> قراءة جزئين
                يومياً بنظام &quot;الحدر&quot; السريع؛ الهدف منها تعويد العين على رسم
                المصحف وتسهيل انسياب الآيات في العقل وربطها ببعضها.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة الاستماع:</Text> الاستماع لورد
                الاستماع اليومي (حزب واحد) بصوت الشيخ الحصري لضبط الأحكام
                والارتقاء بجودة التجويد قبل البدء في الحفظ.
              </Text>
            </View>
          }
        />
        <ExplanationCard
          title="المفتاح الثاني: التحضير (3 مستويات للتمكين)"
          icon="timer-outline"
          color={Colors.fortressPreparation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الأسبوعي:</Text> قراءة صفحات
                ورد الحفظ للأسبوع القادم بالكامل مرة واحدة في يوم الراحة لتكوين
                صورة ذهنية شاملة.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الليلي:</Text> قراءة الصفحة
                المقررة غداً قبل النوم مباشرة؛ العقل الباطن سيقوم
                بتثبيتها ومعالجتها أثناء نومك!
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير القبلي:</Text> قراءة نفس
                الصفحة قبل بدء الحفظ الفعلي لتهيئة الذاكرة القريبة وجعل
                الحفظ يجري بيسر.
              </Text>
            </View>
          }
        />
        <ExplanationCard
          title="المفتاح الثالث: الحفظ الجديد (الإيداع الذكي)"
          icon="create-outline"
          color={Colors.fortressMemorization}
          content="مرحلة التركيز الذهني الكامل؛ كرر كل آية 10 مرات ثم اربطها بما قبلها. لا تنتقل لصفحة جديدة إلا إذا أصبحت قادراً على سرد الصفحة الحالية غيباً دون خطأ واحد وبسرعة."
        />
        <ExplanationCard
          title="المفتاح الرابع: مراجعة القريب (التمكين والربط)"
          icon="sync-outline"
          color={Colors.fortressReview}
          content="مراجعة آخر 20 صفحة (أو آخر جزء) تم حفظها بشكل يومي. هذا المفتاح هو صمام الأمان الذي يحول الحفظ من الذاكرة المؤقتة إلى الدائمة ويمنع النسيان السريع."
        />
        <ExplanationCard
          title="المفتاح الخامس: مراجعة البعيد (التثبيت الأبدي)"
          icon="layers-outline"
          color={Colors.blue}
          content="مراجعة الأجزاء القديمة المسردة بمعدل جزئين يومياً. الهدف هو الوصول لمرحلة 'السرد الغيبي'؛ حيث تقرأ أجزاءك القديمة بانسيابية تامة كأنك تقرأ الفاتحة."
        />

        <SectionHeader title="الروتين اليومي المقترح" color={Colors.gold} />
        <ExplanationCard
          title="الفجر: وقت البركة"
          icon="sunny-outline"
          color={Colors.gold}
          content="أفضل وقت للحفظ الجديد والتحضير القبلي؛ حيث يكون الذهن في أقصى درجات اليقظة والصفاء والهدوء النفسي."
        />
        <ExplanationCard
          title="بعد العصر أو العشاء: التمكين"
          icon="moon-outline"
          color={Colors.purple}
          content="وقت مثالي لمراجعة القريب والبعيد؛ السكينة في هذا الوقت تساعد على استرجاع المحفوظ بهدوء وتثبيته في الذاكرة البعيدة."
        />
        <ExplanationCard
          title="قبل النوم: البذر"
          icon="bed-outline"
          color={Colors.blue}
          content="خصص 15-20 دقيقة للتحضير الليلي لصفحة الغد. اترك عقلك يثبتها لك ويقوم بالمهمة الصعبة أثناء راحتك ونومك."
        />

        <SectionHeader
          title="كيفية تحقيق أقصى استفادة"
          color={Colors.secondary}
        />
        <ExplanationCard
          title="1. التزم بعدّادات التكرار والتايمر"
          icon="stopwatch-outline"
          color={Colors.secondary}
          content="التطبيق يوفر عدادات دقيقة؛ لا تكتفِ بالحفظ الظاهري، بل كرر حتى تنهي الورد المطلوب لضمان 'جودة التكرار' وليس الكم فقط."
        />
        <ExplanationCard
          title="2. عداد التكرارات التفاعلي"
          icon="add-circle-outline"
          color={Colors.primary}
          content="داخل شاشة المؤقت (Timer)، ستجد عداداً يدوياً للتكرارات. استخدمه لضبط عدد مرات قراءة الآية الواحدة أو الصفحة؛ حيث يساعدك هذا العدّ الذهني على زيادة التركيز وضمان عدم شرود الذهن أثناء التكرار."
        />
        <ExplanationCard
          title="3. التقييم الذاتي الصادق"
          icon="checkmark-done-circle-outline"
          color={Colors.success}
          content="بعد تسميع كل ورد، كن صادقاً في تقييم حفظك. إذا كان حفظك مهتزاً، التطبيق سيقترح عليك مراجعة هذه الصفحة قريباً لتقويتها."
        />
        <ExplanationCard
          title="3. ميزان الرسوخ (IQ)"
          icon="bar-chart-outline"
          color={Colors.primary}
          content="راقب لون السور في شاشتك الرئيسية؛ الألوان تمثل 'قوة الرسوخ'. السور التي يميل لونها للأحمر تحتاج لتدخل فوري منك لمراجعتها."
        />

        <SectionHeader title="أبرز مميزات التطبيق الذكية" color={Colors.gold} />
        {[
          {
            title: "خوارزمية المراجعة المتباعدة",
            icon: "infinite-outline",
            color: Colors.primary,
            content:
              "يقوم التطبيق بذكاء بتحديد أي الصفحات تحتاج لمراجعة اليوم بناءً على تاريخ آخر مراجعة وقوة حفظك، ليضمن عدم نسيانك.",
          },
          {
            title: "الخطة المرنة والمتكاملة",
            icon: "calendar-outline",
            color: Colors.success,
            content:
              "سواء كنت تحفظ صفحة أو جزئين، يتكيف النظام تلقائياً مع وتيرتك، مع إمكانية تخصيص أيام للراحة والمراجعة فقط.",
          },
          {
            title: "وضعية الختم المبارك",
            icon: "trophy-outline",
            color: Colors.gold,
            content:
              "احتفالات وتنبيهات محفزة عند إتمام الأجزاء والأحزاب، مما يزيد من دافعيتك نحو الإتمام والإتقان.",
          },
          {
            title: "المزامنة السحابية وآمن البيانات",
            icon: "cloud-upload-outline",
            color: Colors.blue,
            content:
              "جميع بيانات تقدمك ومستواك في الرسوخ محفوظة دائماً؛ يمكنك استرجاعها حتى لو قمت بتغيير هاتفك أو مسح التطبيق.",
          },
          {
            title: "مشغل الصوت (منهج الحصري)",
            icon: "musical-note",
            color: Colors.purple,
            content:
              "دعم مدمج للاستماع لورد الاستماع اليومي لضمان ضبط المخارج والأحكام وفق منهجية علمية رصينة.",
          },
          {
            title: "دعم المصاحف المتعددة",
            icon: "book-outline",
            color: Colors.fortressRecitation,
            content:
              "دعم كامل لمصحف المدينة القديم والجديد، الشمرلي، والباكستاني لضمان راحتك البصرية أثناء المتابعة.",
          },
        ].map((feat, idx) => (
          <ExplanationCard
            key={idx}
            title={feat.title}
            icon={feat.icon}
            color={feat.color}
            content={feat.content}
          />
        ))}

        <SectionHeader title="ميزان الرسوخ (مستويات الحفظ)" color={Colors.primary} />
        <View style={styles.stabilityGuide}>
          <Text style={styles.subParagraph}>
            ينقسم حفظك في التطبيق إلى 5 مستويات ذكية تتأثر بأدائك في الاختبارات والمراجعات الدورية:
          </Text>
          <View style={styles.levelRow}>
            <View style={[styles.levelDot, { backgroundColor: Colors.red }]} />
            <Text style={styles.levelText}><Text style={styles.bold}>المستوى 1 (ضعيف):</Text> حفظ جديد أو مهتز يحتاج مراجعة مكثفة فورية.</Text>
          </View>
          <View style={styles.levelRow}>
            <View style={[styles.levelDot, { backgroundColor: Colors.gold }]} />
            <Text style={styles.levelText}><Text style={styles.bold}>المستوى 2-3 (متوسط):</Text> حفظ بدأ يستقر ولكنه يحتاج لربط الآيات ببعضها.</Text>
          </View>
          <View style={styles.levelRow}>
            <View style={[styles.levelDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.levelText}><Text style={styles.bold}>المستوى 4 (قوي):</Text> حفظ راسخ يمكنك سرده بطلاقة مع قليل من الجهد.</Text>
          </View>
          <View style={styles.levelRow}>
            <View style={[styles.levelDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.levelText}><Text style={styles.bold}>المستوى 5 (متين):</Text> الحفظ الأبدي؛ صفحات تقرؤها عن ظهر قلب كالفاتحة.</Text>
          </View>
        </View>

        <TimeManagementCard Colors={Colors} />
        <DeveloperCard Colors={Colors} />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (Colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
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
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginVertical: Spacing.lg,
      width: "100%",
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: Colors.border,
      opacity: 0.3,
    },
    sectionTitle: {
      fontFamily: Typography.heading,
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      paddingHorizontal: Spacing.md,
    },
    bold: {
      fontWeight: "bold",
      color: Colors.textPrimary,
    },
    subParagraph: {
      fontFamily: Typography.body,
      fontSize: 13,
      color: Colors.textSecondary,
      lineHeight: 20,
      textAlign: "left",
      marginBottom: Spacing.xs,
    } as TextStyle,
    stabilityGuide: {
      backgroundColor: Colors.surfaceElevated,
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      borderWidth: 1,
      borderColor: Colors.border,
    } as ViewStyle,
    levelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 10,
    } as ViewStyle,
    levelDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    } as ViewStyle,
    levelText: {
      flex: 1,
      fontSize: 13,
      color: Colors.textSecondary,
      lineHeight: 20,
      textAlign: "left",
    } as TextStyle,
  });
