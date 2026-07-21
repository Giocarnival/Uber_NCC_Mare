import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { getDriverByUserId } from "@/services/driverService";
import { scanBookingForBoarding, type BoardingResult } from "@/services/bookingService";

export default function DriverQrScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<BoardingResult | null>(null);

  async function handleScanned(data: string) {
    if (!scanning || !user) return;
    setScanning(false);

    const driver = await getDriverByUserId(user.uid);
    if (!driver?.vehicleId) {
      setResult({ ok: false, reason: "Nessun veicolo assegnato." });
      return;
    }

    const outcome = await scanBookingForBoarding(data, driver.vehicleId);
    setResult(outcome);
  }

  function scanAgain() {
    setResult(null);
    setScanning(true);
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={48} color={colors.muted} />
        <Text style={styles.permissionText}>Serve il permesso fotocamera per scansionare i biglietti.</Text>
        <PrimaryButton label="Consenti fotocamera" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scanning ? (
        <View style={styles.cameraWrap}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }) => handleScanned(data)}
          />
          <View style={styles.frame} />
          <Text style={styles.hint}>Inquadra il QR code del biglietto</Text>
        </View>
      ) : (
        <View style={styles.resultWrap}>
          <View style={[styles.resultBadge, { backgroundColor: result?.ok ? colors.success : colors.danger }]}>
            <Ionicons name={result?.ok ? "checkmark" : "close"} size={40} color={colors.white} />
          </View>
          <Text style={styles.resultTitle}>{result?.ok ? "Salita confermata" : "Biglietto rifiutato"}</Text>
          {result?.booking && <Text style={styles.resultCode}>{result.booking.bookingCode}</Text>}
          {result?.booking && (
            <Text style={styles.resultMeta}>{result.booking.numeroPasseggeri} passeggeri</Text>
          )}
          {!result?.ok && <Text style={styles.resultReason}>{result?.reason}</Text>}
          <PrimaryButton label="Scansiona il prossimo" icon="qr-code-outline" onPress={scanAgain} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.md },
  permissionText: { color: colors.white, textAlign: "center" },
  cameraWrap: { flex: 1, width: "100%", alignItems: "center", justifyContent: "center" },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    backgroundColor: "transparent",
  },
  hint: { color: colors.white, marginTop: spacing.lg, fontWeight: "600" },
  resultWrap: { alignItems: "center", gap: spacing.md, padding: spacing.lg },
  resultBadge: { width: 72, height: 72, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  resultTitle: { color: colors.white, fontSize: typography.heading.fontSize, fontWeight: "800" },
  resultCode: { color: colors.white, fontSize: typography.body.fontSize, fontWeight: "700", letterSpacing: 1 },
  resultMeta: { color: colors.sand },
  resultReason: { color: colors.sand, textAlign: "center" },
});
