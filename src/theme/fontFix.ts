import { StyleSheet, Text, TextInput } from "react-native";

// ── Global Font Patching ─────────────────────────────────────────────────────
// This approach is compatible with most React Native versions and avoids 
// read-only property errors. It covers both StyleSheet and default props.

const TAJAWAL_BOLD = "Tajawal_700Bold";
const TAJAWAL_MEDIUM = "Tajawal_500Medium";

// 1. Patch StyleSheet.create
const oldCreate = StyleSheet.create;
(StyleSheet as any).create = (obj: any) => {
  const newObj = { ...obj };
  for (const key in newObj) {
    const style = newObj[key];
    if (style && (style.fontSize || style.fontWeight || style.color) && !style.fontFamily) {
      const isBold = style.fontWeight === 'bold' || style.fontWeight === '700' || style.fontWeight === '900';
      newObj[key] = { 
        ...style,
        fontFamily: isBold ? TAJAWAL_BOLD : TAJAWAL_MEDIUM, 
        fontWeight: 'normal', // Reset weight to avoid system font fallback
      };
    }
  }
  return oldCreate(newObj);
};

// 2. Set defaultProps for Text and TextInput
// This covers cases where components don't have an explicit style or have an empty one.
if ((Text as any).defaultProps == null) (Text as any).defaultProps = {};
(Text as any).defaultProps.style = { 
  fontFamily: TAJAWAL_MEDIUM, 
  textAlign: 'right',
  fontWeight: 'normal'
};

if ((TextInput as any).defaultProps == null) (TextInput as any).defaultProps = {};
(TextInput as any).defaultProps.style = { 
  fontFamily: TAJAWAL_MEDIUM, 
  textAlign: 'right',
  fontWeight: 'normal'
};

console.log("[FontFix] Global font patching applied via safe overrides.");
