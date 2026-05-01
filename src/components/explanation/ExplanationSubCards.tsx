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

  // Sync scroll position when index changes (should really be handled by FlatList but let's stick to what works)
  React.useEffect(() => {
    if (selectedIndex !== null && scrollRef.current) {
      // Small timeout to ensure modal is mounted
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
        <View style={[styles.iconBox, { backgroundColor: Colors.purpleMuted }]}>
          <Ionicons name="images-outline" size={24} color={Colors.purple} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>
            العرض التوضيحي للمنهجية
          </Text>
          <Text style={[styles.hint, { color: Colors.textTertiary }]}>
            اضغط على الصورة للتكبير أو اسحب يميناً ويساراً لمشاهدة باقي العرض
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.82 + Spacing.md}
        decelerationRate="fast"
        contentContainerStyle={styles.horizontalScroll}
      >
        {PRESENTATION_IMAGES.map((img, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.9}
            onPress={() => setSelectedIndex(index)}
            style={styles.horizontalImageContainer}
          >
            <Image
              source={img}
              style={styles.presentationImage}
              resizeMode="contain"
            />
            <View style={styles.zoomIcon}>
              <Ionicons name="search-outline" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={selectedIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.modalActionBtn} onPress={zoomIn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalActionBtn} onPress={zoomOut}>
              <Ionicons name="remove" size={24} color="#FFF" />
            </TouchableOpacity>

            {selectedIndex !== null && (
              <View style={styles.pageIndicator}>
                <Text style={styles.pageText}>
                  {selectedIndex + 1} / {PRESENTATION_IMAGES.length}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalActionBtn, { marginLeft: "auto" }]}
              onPress={handleClose}
            >
              <Ionicons name="close" size={24} color="#FFF" />
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
              setScale(1); // Reset scale when swiping
            }}
            scrollEnabled={scale === 1} // Only swipe when not zoomed
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

          {scale > 1 && (
            <View style={styles.zoomIndicator}>
              <Text style={styles.zoomText}>
                نسبة التكبير: {Math.round(scale * 100)}%
              </Text>
            </View>
          )}
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
          backgroundColor: Colors.surface,
          borderColor: Colors.border,
          marginTop: Spacing.lg,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.blueMuted }]}>
          <Ionicons name="time" size={24} color={Colors.blue} />
        </View>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>
          إدارة وقت الحفظ
        </Text>
      </View>
      <View style={styles.timeGrid}>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.primary }]}>45د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>
            حفظ جديد
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.gold }]}>30د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>
            مراجعة
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={[styles.timeValue, { color: Colors.purple }]}>15د</Text>
          <Text style={[styles.timeLabel, { color: Colors.textTertiary }]}>
            تحضير
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
    paddingRight: 40,
  },
  horizontalImageContainer: {
    width: SCREEN_WIDTH * 0.82,
    aspectRatio: 16 / 9,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    marginBottom: 0,
  },
  presentationImage: {
    width: "100%",
    height: "100%",
  },
  zoomIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 6,
    borderRadius: 20,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.98)",
  },
  modalHeader: {
    flexDirection: "row",
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
    gap: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingBottom: 15,
  },
  pageIndicator: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
  },
  pageText: {
    color: "#FFF",
    fontFamily: Typography.heading,
    fontSize: 14,
  },
  modalActionBtn: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  zoomIndicator: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomText: {
    color: "#FFF",
    fontFamily: Typography.body,
    fontSize: 12,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  title: {
    fontFamily: Typography.heading,
    fontSize: Typography.md,
  },
  hint: {
    fontFamily: Typography.body,
    fontSize: 10,
    marginTop: 2,
  },
  description: {
    fontFamily: Typography.body,
    fontSize: Typography.sm,
    lineHeight: 20,
  },
  timeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  timeItem: {
    alignItems: "center",
    flex: 1,
  },
  timeValue: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
  },
  timeLabel: {
    fontFamily: Typography.body,
    fontSize: Typography.xs,
    marginTop: 2,
  },
});
