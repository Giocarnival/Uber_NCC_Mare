import { View, Text, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  bookingCode: string;
}

export function TicketQRCode({ bookingCode }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.qrCard}>
        <QRCode value={bookingCode} size={180} color={colors.ink} backgroundColor={colors.white} />
      </View>
      <Text style={styles.code}>{bookingCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.md },
  qrCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  code: { fontSize: typography.heading.fontSize, fontWeight: "800", letterSpacing: 2, color: colors.ink },
});
