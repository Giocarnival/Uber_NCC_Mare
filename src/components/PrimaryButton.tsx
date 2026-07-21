import { Pressable, Text, View, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, disabled, loading, variant = "primary", icon, style }: Props) {
  const isDisabled = disabled || loading;
  const contentColor = variant === "secondary" ? colors.sea : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "danger" && styles.danger,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={18} color={contentColor} />}
          <Text style={[styles.label, { color: contentColor }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  primary: { backgroundColor: colors.sea },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sea },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { fontSize: typography.body.fontSize, fontWeight: "700" },
});
