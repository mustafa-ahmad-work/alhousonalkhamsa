import { useState, useEffect } from 'react';
import { HusoonAlert } from '../components/shared/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAppStore } from '../store/AppStore';
import { useSelectionStore } from '../store/selectionStore';
import { NotificationService } from '../store/NotificationService';
import { getMushafEdition } from '../data/mushafEditions';
import { SURAHS } from '../data/quranMeta';
import { useThemeStore } from '../store/ThemeStore';

export type EditType =
  | "name"
  | "goal"
  | "dailyPages"
  | "memorizationTimer"
  | "reviewTimer"
  | "preparationTimer"
  | "recitationTimer"
  | "listeningTimer"
  | "startPage"
  | "endPage"
  | "planDirection"
  | "dailyAyahs"
  | "recitationTime"
  | "listeningTime"
  | "weeklyPrepTime"
  | "nightlyPrepTime"
  | "dailyPrepTime"
  | "memorizationTime"
  | "reviewTime";

export function useSettingsLogic() {
  const { state, dispatch } = useAppStore();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editType, setEditType] = useState<EditType>("name");
  const [editValue, setEditValue] = useState("");



  const [planMode, setPlanMode] = useState<"daily" | "weekly">((state.settings as any).planMode ?? "daily");
  const [dailyPages, setDailyPages] = useState<number>(state.user?.dailyPages ?? 1);
  const [activeDaysOfWeek, setActiveDaysOfWeek] = useState<number[]>((state.settings as any).activeDaysOfWeek ?? [0, 1, 2, 3, 4]);

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  const [permStatus, setPermStatus] = useState<string>("undetermined");

  useEffect(() => {
    // Selection type is now always complete
  }, [state.plan, state.settings.mushafEdition]);

  useEffect(() => {
    NotificationService.getPermissionStatus().then(setPermStatus);
  }, []);

  const handleEdit = (type: string) => {
    setEditType(type as EditType);
    let value = "";
    if (type === "name") value = state.user?.name ?? "";
    else if (type === "goal") value = state.user?.goal ?? "";
    else if (type === "dailyPages") value = (state.user?.dailyPages ?? 0).toString();
    else if (type === "memorizationTimer") value = (state.settings.memorizationTimerMinutes ?? 15).toString();
    else if (type === "reviewTimer") value = (state.settings.reviewTimerMinutes ?? 15).toString();
    else if (type === "preparationTimer") value = (state.settings.preparationTimerMinutes || 15).toString();
    else if (type === "recitationTimer") value = (state.settings.recitationTimerMinutes || 20).toString();
    else if (type === "listeningTimer") value = (state.settings.listeningTimerMinutes || 15).toString();
    else if (type.endsWith("Time")) value = (state.settings.notifications as any)[type] ?? "08:00";

    if (type.endsWith("Time")) {
      const [h, m] = value.split(":").map(Number);
      setSelectedHour(h || 0);
      setSelectedMinute(m || 0);
      setTimePickerVisible(true);
    } else {
      setEditValue(value);
      setEditModalVisible(true);
    }
  };

  const saveEdit = () => {
    if (editType === "dailyPages") {
      dispatch({ type: "UPDATE_USER", payload: { dailyPages: parseInt(editValue, 10) || 0 } });
    } else if (editType === "memorizationTimer") {
      dispatch({ type: "UPDATE_SETTINGS", payload: { memorizationTimerMinutes: parseInt(editValue, 10) || 15 } });
    } else if (editType === "reviewTimer") {
      dispatch({ type: "UPDATE_SETTINGS", payload: { reviewTimerMinutes: parseInt(editValue, 10) || 15 } });
    } else if (editType === "preparationTimer") {
      dispatch({ type: "UPDATE_SETTINGS", payload: { preparationTimerMinutes: parseInt(editValue, 10) || 15 } });
    } else if (editType === "recitationTimer") {
      dispatch({ type: "UPDATE_SETTINGS", payload: { recitationTimerMinutes: parseInt(editValue, 10) || 20 } });
    } else if (editType === "listeningTimer") {
      dispatch({ type: "UPDATE_SETTINGS", payload: { listeningTimerMinutes: parseInt(editValue, 10) || 15 } });
    } else {
      dispatch({ type: "UPDATE_USER", payload: { [editType]: editValue } });
    }
    setEditModalVisible(false);
  };

  const saveSelectedTime = () => {
    const formattedTime = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { notifications: { ...state.settings.notifications, [editType]: formattedTime } },
    });
    setTimePickerVisible(false);
  };

  const applyPlanChanges = (overrideEditionId?: string) => {
    const editionId = overrideEditionId ?? (state.settings as any).mushafEdition ?? "madani_604";
    const edition = getMushafEdition(editionId);
    const totalPages = edition.totalPages;
    let pages: number[] = [];
    let label = "";

    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    label = `القرآن الكريم كاملاً — ${edition.nameAr}`;

    if (pages.length === 0) {
      HusoonAlert.alert("خطأ", "يرجى اختيار نطاق صحيح", [], "error");
      return;
    }

    dispatch({
      type: "REGENERATE_PLAN",
      payload: { pageNumbers: pages, label, direction: "forward" },
    });
    HusoonAlert.alert("تم التحديث", `تم إنشاء خطة جديدة بنجاح`, [], "success");
  };

  const applyPlanModeSettings = () => {
    const finalActiveDays = planMode === "daily" ? [0, 1, 2, 3, 4, 5, 6] : activeDaysOfWeek;
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { planMode, activeDaysOfWeek: finalActiveDays } as any,
    });
    dispatch({ type: "UPDATE_USER", payload: { dailyPages } });
    applyPlanChanges();
  };

  const handleReset = () => {
    HusoonAlert.alert(
      "مسح البيانات بالكامل",
      "هل أنت متأكد من مسح جميع بيانات الحفظ والتقدم؟ هذا الإجراء لا يمكن التراجع عنه.",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "مسح البيانات",
          style: "destructive",
          onPress: async () => {
            try {
              await NotificationService.cancelAllFortressReminders();
              await AsyncStorage.clear();
              dispatch({ type: "RESET" });
              useSelectionStore.getState().reset();
              router.replace("/" as any);
            } catch (e) {
              HusoonAlert.alert("خطأ", "فشل مسح البيانات، يرجى المحاولة مرة أخرى.", [], "error");
            }
          },
        },
      ],
      "delete"
    );
  };

  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  const handleToggleTheme = () => {
    toggleTheme();
  };

  const toggleNotifField = (field: string) => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: {
        notifications: {
          ...state.settings.notifications,
          [field]: !(state.settings.notifications as any)[field],
        },
      },
    });
  };

  const currentEditionId = (state.settings as any).mushafEdition ?? "madani_604";
  const isMasterEnabled = state.settings.notifications.enabled;

  return {
    state,
    dispatch,
    editModalVisible,
    setEditModalVisible,
    editType,
    setEditType,
    editValue,
    setEditValue,
    planMode,
    setPlanMode,
    dailyPages,
    setDailyPages,
    activeDaysOfWeek,
    setActiveDaysOfWeek,
    timePickerVisible,
    setTimePickerVisible,
    selectedHour,
    setSelectedHour,
    selectedMinute,
    setSelectedMinute,
    permStatus,
    setPermStatus,
    handleEdit,
    saveEdit,
    saveSelectedTime,
    applyPlanModeSettings,
    applyPlanChanges,
    handleReset,
    handleToggleTheme,
    toggleNotifField,
    currentEditionId,
    isMasterEnabled
  };
}
