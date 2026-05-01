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
          title="فلسفة التطبيق: إتقان كالفاتحة"
          color={Colors.gold}
        />
        <View style={styles.stabilityGuide}>
          <Text style={styles.subParagraph}>
            هذا التطبيق هو <Text style={styles.bold}>نظام هندسي متكامل</Text> لختم القرآن الكريم كاملاً حفظاً وإتقاناً. يعتمد النظام على "منهجية المفاتيح الخمسة" التي تحول الآيات إلى جزء من ذاكرتك الدائمة عبر تكرار ذكي مبني على أسس علمية ونفسية دقيقة.
          </Text>
          <Text style={styles.subParagraph}>
            يهدف التطبيق إلى معالجة أكبر عائق يواجه الحفاظ: <Text style={styles.bold}>النسيان وتشتت المراجعة</Text>، من خلال جدولة آلية دقيقة تضمن لك عدم ترك أي صفحة دون تمكين.
          </Text>
        </View>

        <SectionHeader
          title="الركن الركين: منهجية المفاتيح الخمسة"
          color={Colors.primary}
        />
        <ExplanationCard
          title="المفتاح 1: الختمة (بناء الألفة البصرية والسمعية)"
          icon="book-outline"
          color={Colors.fortressRecitation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة التلاوة:</Text> قراءة جزئين يومياً بنظام "الحدر" السريع لتسهيل انسياب الآيات في العقل وربط السور ببعضها.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>ختمة الاستماع:</Text> الاستماع اليومي بصوت الشيخ الحصري لضبط مخارج الحروف وترسيخ النغمة الصحيحة في الوجدان.
              </Text>
            </View>
          }
        />
        <ExplanationCard
          title="المفتاح 2: التحضير (تهيئة الذاكرة الثلاثية)"
          icon="timer-outline"
          color={Colors.fortressPreparation}
          content={
            <View>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الأسبوعي:</Text> نظرة استباقية لورد الأسبوع القادم.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير الليلي:</Text> قراءة صفحة الغد قبل النوم مباشرة لمعالجتها أثناء النوم.
              </Text>
              <Text style={styles.subParagraph}>
                • <Text style={styles.bold}>التحضير القبلي:</Text> تنشيط الذاكرة القريبة قبل البدء بالحفظ مباشرة.
              </Text>
            </View>
          }
        />
        <ExplanationCard
          title="المفتاح 3: الحفظ الجديد (الإيداع في الذاكرة)"
          icon="create-outline"
          color={Colors.fortressMemorization}
          content="مرحلة التركيز القصوى لحفظ الصفحات المقررة. التطبيق يحدد لك عدد الصفحات الكاملة يومياً بناءً على طاقتك، ويوفر لك عدادات تكرار لضمان 'جودة الإيداع'."
        />
        <ExplanationCard
          title="المفتاح 4: مراجعة القريب (صمام الأمان)"
          icon="sync-outline"
          color={Colors.fortressReview}
          content="مراجعة آخر 20 صفحة تم حفظها يومياً. هذا القسم يحمي حفظك الجديد من التآكل السريع وينقله للذاكرة المتوسطة."
        />
        <ExplanationCard
          title="المفتاح 5: مراجعة البعيد (مرحلة الرسوخ)"
          icon="layers-outline"
          color={Colors.blue}
          content="مراجعة الأجزاء القديمة المسردة للوصول لمرحلة السرد كالفاتحة عبر جدولة آلية تمر بك على كامل محفوظك."
        />

        <SectionHeader title="جولة داخل التطبيق (للمبتدئين)" color={Colors.gold} />
        <ExplanationCard
          title="1. الشاشة الرئيسية (المفاتيح الملونة)"
          icon="home-outline"
          color={Colors.primary}
          content="لوحة تحكمك اليومية؛ كل 'مفتاح' ملون يمثل ركناً من المنهجية. المربعات تظهر حالة وردك، وبالضغط عليها تبدأ المهمة فوراً."
        />
        <ExplanationCard
          title="2. شاشة التنفيذ (المؤقت والعداد)"
          icon="stopwatch-outline"
          color={Colors.success}
          content="تتضمن مؤقتاً للوقت وعداداً يدوياً للتكرارات لضمان الالتزام بنصاب التكرار المطلوب لكل آية وصفحة."
        />
        <ExplanationCard
          title="3. شاشة الخطة (الجدولة الذكية)"
          icon="calendar-outline"
          color={Colors.blue}
          content="هنا تختار طاقتك اليومية (عدد الصفحات) وتحدد أيام العمل في الأسبوع. النظام يقوم تلقائياً بجدولة المصحف كاملاً بناءً على هذه الاختيارات."
        />
        <ExplanationCard
          title="4. شاشة الإحصائيات (ميزان الرسوخ)"
          icon="stats-chart-outline"
          color={Colors.purple}
          content="تحلل جودة حفظك وتعرض 'ميزان الرسوخ'. السور الخضراء تعني أنها متينة، والحمراء تنبهك لضرورة المراجعة العاجلة."
        />

        <SectionHeader title="أدوات الإتقان (مميزات فريدة)" color={Colors.success} />
        <ExplanationCard
          title="المشغل الصوتي المدمج"
          icon="play-circle-outline"
          color={Colors.fortressListening}
          content="لا حاجة لمغادرة التطبيق؛ يمكنك الاستماع لورد 'ختمة الاستماع' مباشرة من داخل التطبيق بصوت الشيخ الحصري، مع إمكانية التنقل بين الصفحات والآيات بسهولة."
        />
        <ExplanationCard
          title="قارئ القرآن التفاعلي"
          icon="book-outline"
          color={Colors.primary}
          content="يوفر التطبيق مصحفاً رقمياً تفاعلياً لكل ورد (تلاوة أو حفظ)، حيث يمكنك القراءة مباشرة من الشاشة ومتابعة تقدمك صفحة بصفحة."
        />
        <ExplanationCard
          title="نظام الاختبارات (Quiz)"
          icon="extension-puzzle-outline"
          color={Colors.gold}
          content="اختبر قوة رسوخك من خلال نظام اختبارات ذكي يطرح عليك أسئلة من محفوظك، ويحدد لك مواضع الضعف التي تحتاج لمزيد من المراجعة."
        />
        <ExplanationCard
          title="سجل الإنجاز (Achievement History)"
          icon="time-outline"
          color={Colors.blue}
          content="يوثق التطبيق كل ورد أتممته بالوقت والتاريخ، مما يعطيك دفعة معنوية لرؤية تراكم إنجازاتك يوماً بعد يوم."
        />

        <SectionHeader title="أسرار الإعدادات (الإعدادات المتقدمة)" color={Colors.primary} />
        <ExplanationCard
          title="مرونة الخطة (يومي / أسبوعي)"
          icon="options-outline"
          color={Colors.primary}
          content="يمكنك الاختيار بين 'الخطة اليومية' التي توزع الورد بالتساوي، أو 'الخطة الأسبوعية' التي تتيح لك حرية أكبر في التنفيذ خلال الأسبوع. كما يمكنك تحديد أيام محددة فقط للحفظ (مثلاً 5 أيام حفظ ويومان مراجعة)."
        />
        <ExplanationCard
          title="طبعة المصحف واستراتيجيات المراجعة"
          icon="layers-outline"
          color={Colors.gold}
          content="اختر طبعة المصحف التي تفضلها (المدينة، الشمرلي، إلخ) وطبق استراتيجيات مراجعة متقدمة مثل 'التكرار المتباعد SSR' لضمان أعلى مستويات الرسوخ."
        />
        <ExplanationCard
          title="قوالب التنبيهات الذكية"
          icon="notifications-outline"
          color={Colors.success}
          content="استخدم القوالب الجاهزة (البكور، القياسي، المتأخر) لضبط مواعيد كل المفاتيح بضغطة واحدة، وفعل الاهتزاز اللمسي (Haptics) لزيادة التركيز أثناء العد."
        />

        <SectionHeader title="ميزان الرسوخ (مستويات الحفظ)" color={Colors.primary} />
        <View style={styles.stabilityGuide}>
          <Text style={styles.subParagraph}>
            ينقسم حفظك في التطبيق إلى 5 مستويات ذكية تتأثر بأدائك في المراجعات الدورية:
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
