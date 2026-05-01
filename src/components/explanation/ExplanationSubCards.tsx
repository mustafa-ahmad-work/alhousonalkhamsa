import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BorderRadius, Spacing, Typography } from "../../theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface SubCardProps {
  Colors: any;
}

const PRESENTATION_IMAGES = [
  require("../../../assets/images/explanation/1.png"),
  require("../../../assets/images/explanation/2.png"),
  require("../../../assets/images/explanation/3.png"),
  require("../../../assets/images/explanation/4.png"),
  require("../../../assets/images/explanation/5.png"),
  require("../../../assets/images/explanation/6.png"),
  require("../../../assets/images/explanation/7.png"),
  require("../../../assets/images/explanation/8.png"),
  require("../../../assets/images/explanation/9.png"),
  require("../../../assets/images/explanation/10.png"),
  require("../../../assets/images/explanation/11.png"),
  require("../../../assets/images/explanation/12.png"),
];

export const PresentationCard: React.FC<SubCardProps> = ({ Colors }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const scrollRef = React.useRef<ScrollView>(null);

  const handleClose = () => {
    setSelectedIndex(null);
    setScale(1);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));

  React.useEffect(() => {
    if (selectedIndex !== null && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: selectedIndex * SCREEN_WIDTH,
          animated: false,
        });
      }, 50);
    }
  }, [selectedIndex]);

  return (
    <View style={styles.presentationWrap}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.purple + '20' }]}>
          <Ionicons name="images" size={20} color={Colors.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>
            العرض التوضيحي للمنهجية
          </Text>
          <Text style={[styles.hint, { color: Colors.textTertiary }]}>
            اسحب لمشاهدة الخطوات العملية للحفظ
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.85 + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.horizontalScroll}
      >
        {PRESENTATION_IMAGES.map((img, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => setSelectedIndex(index)}
            style={[styles.horizontalImageContainer, { borderColor: Colors.border }]}
          >
            <View style={styles.imageInner}>
              <Image
                source={img}
                style={styles.presentationImage}
                resizeMode="cover"
              />
              <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]} />
              <View style={styles.zoomIcon}>
                <Ionicons name="expand" size={18} color="#FFF" />
              </View>
              <View style={styles.indexBadge}>
                <Text style={styles.indexText}>{index + 1}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <View style={styles.modalControls}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={zoomIn}>
                <Ionicons name="add" size={24} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={zoomOut}>
                <Ionicons name="remove" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {selectedIndex !== null && (
              <View style={styles.pageIndicator}>
                <Text style={styles.pageText}>
                  {selectedIndex + 1} من {PRESENTATION_IMAGES.length}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={handleClose}
            >
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setSelectedIndex(newIndex);
              setScale(1);
            }}
            scrollEnabled={scale === 1}
          >
            {PRESENTATION_IMAGES.map((img, index) => (
              <View
                key={index}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
              >
                <ScrollView
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                >
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                  >
                    <View
                      style={{
                        width: SCREEN_WIDTH * scale,
                        height: SCREEN_HEIGHT * scale,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={img}
                        style={{
                          width: SCREEN_WIDTH * scale,
                          height: SCREEN_HEIGHT * scale,
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </ScrollView>
                </ScrollView>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export const TimeManagementCard: React.FC<SubCardProps> = ({ Colors }) => {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors.surfaceElevated,
          borderColor: Colors.border,
          marginTop: Spacing.xl,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="timer-outline" size={22} color={Colors.primary} />
        </View>
        <View>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>
            توزيع الوقت المقترح
          </Text>
          <Text style={[styles.hint, { color: Colors.textTertiary }]}>
            بناءً على متوسط إنجاز الطالب المجتهد
          </Text>
        </View>
      </View>

      <View style={styles.timeContainer}>
        {/* Total Time Header */}
        <View style={[styles.totalTimeBox, { backgroundColor: Colors.primary + '10' }]}>
          <Text style={[styles.totalLabel, { color: Colors.textSecondary }]}>الجدول الزمني المثالي (90 دقيقة)</Text>
          <Text style={[styles.totalValue, { color: Colors.primary }]}>ساعة ونصف يومياً</Text>
        </View>

        {/* Detailed Breakdown */}
        <View style={styles.breakdownGrid}>
          <View style={[styles.timeSlot, { backgroundColor: Colors.surface }]}>
            <Ionicons name="book-outline" size={18} color={Colors.fortressRecitation || Colors.blue} />
            <Text style={[styles.slotLabel, { color: Colors.textSecondary }]}>الختمة</Text>
            <Text style={[styles.slotValue, { color: Colors.textPrimary }]}>25 د</Text>
          </View>
          
          <View style={[styles.timeSlot, { backgroundColor: Colors.surface }]}>
            <Ionicons name="timer-outline" size={18} color={Colors.fortressPreparation || Colors.gold} />
            <Text style={[styles.slotLabel, { color: Colors.textSecondary }]}>التحضير</Text>
            <Text style={[styles.slotValue, { color: Colors.textPrimary }]}>25 د</Text>
          </View>

          <View style={[styles.timeSlot, { backgroundColor: Colors.surface }]}>
            <Ionicons name="create-outline" size={18} color={Colors.fortressMemorization || Colors.purple} />
            <Text style={[styles.slotLabel, { color: Colors.textSecondary }]}>الحفظ</Text>
            <Text style={[styles.slotValue, { color: Colors.textPrimary }]}>15 د</Text>
          </View>

          <View style={[styles.timeSlot, { backgroundColor: Colors.surface }]}>
            <Ionicons name="sync-outline" size={18} color={Colors.fortressReview || Colors.success} />
            <Text style={[styles.slotLabel, { color: Colors.textSecondary }]}>المراجعة</Text>
            <Text style={[styles.slotValue, { color: Colors.textPrimary }]}>25 د</Text>
          </View>
        </View>

        {/* Visual Timeline Bar */}
        <View style={[styles.progressBar, { backgroundColor: Colors.border + '30' }]}>
          <View style={[styles.progressSegment, { width: '28%', backgroundColor: Colors.fortressRecitation || Colors.blue }]} />
          <View style={[styles.progressSegment, { width: '28%', backgroundColor: Colors.fortressPreparation || Colors.gold }]} />
          <View style={[styles.progressSegment, { width: '16%', backgroundColor: Colors.fortressMemorization || Colors.purple }]} />
          <View style={[styles.progressSegment, { width: '28%', backgroundColor: Colors.fortressReview || Colors.success }]} />
        </View>
        
        <View style={styles.footerNote}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
          <Text style={[styles.footerText, { color: Colors.textTertiary }]}>
            يمكنك دمج ختمة الاستماع والتحضير الليلي أثناء الأنشطة اليومية لتقليل الوقت الفعلي.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  presentationWrap: {
    marginBottom: Spacing.xl,
  },
  horizontalScroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  horizontalImageContainer: {
    width: SCREEN_WIDTH * 0.85,
    aspectRatio: 16 / 9.5,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  imageInner: {
    flex: 1,
  },
  presentationImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  zoomIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  indexBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  indexText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBg: {
    flex: 1,
    backgroundColor: "#000",
  },
  modalHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 100,
    paddingBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pageIndicator: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pageText: {
    color: "#FFF",
    fontFamily: Typography.heading,
    fontSize: 13,
  },
  modalActionBtn: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: 16,
    marginBottom: 2,
  },
  hint: {
    fontFamily: Typography.body,
    fontSize: 11,
  },
  timeContainer: {
    gap: Spacing.md,
  },
  totalTimeBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: Typography.body,
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: Typography.heading,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  timeSlot: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    gap: 4,
  },
  slotLabel: {
    fontSize: 10,
    fontFamily: Typography.body,
  },
  slotValue: {
    fontSize: 14,
    fontFamily: Typography.heading,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  progressSegment: {
    height: '100%',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
    paddingHorizontal: 4,
  },
  footerText: {
    fontSize: 10,
    fontFamily: Typography.body,
    flex: 1,
    lineHeight: 14,
  },
});
