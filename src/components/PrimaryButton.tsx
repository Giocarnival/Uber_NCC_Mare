import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
  style?: ViewStyle;
}

export function PrimaryButton({ label, onPress, disabled, loading, variant = "primary", style }: Props) {
  const isDisabled = disabled || loading;
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
        <ActivityIndicator color={variant === "secondary" ? colors.sea : colors.white} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === "secondary" && { color: colors.sea },
          ]}
        >
          {label}
        </Text>
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
  primary: { backgroundColor: colors.sea },
  secondary: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sea },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { color: colors.white, fontSize: typography.body.fontSize, fontWeight: "700" },
});
