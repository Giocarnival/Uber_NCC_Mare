import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, typography } from "../constants/theme";

interface Props {
  bookingCode: string;
}

/**
 * Placeholder di rendering del QR code. Per la generazione reale integrare
 * "react-native-qrcode-svg" (già elencato in package.json) passando
 * `value={bookingCode}` al componente <QRCode />.
 */
export function TicketQRCode({ bookingCode }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrLabel}>QR</Text>
      </View>
      <Text style={styles.code}>{bookingCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: spacing.md },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: radius.md,
    backgroundColor: colors.sand,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrLabel: { fontSize: 32, fontWeight: "800", color: colors.seaDark },
  code: { fontSize: typography.heading.fontSize, fontWeight: "800", letterSpacing: 2, color: colors.ink },
});
