import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { StripePaymentPanel } from "@/components/StripePaymentPanel";
import { colors, spacing, typography } from "@/constants/theme";

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pagamento</Text>
      <StripePaymentPanel bookingId={bookingId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.md, justifyContent: "center" },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.ink },
});
