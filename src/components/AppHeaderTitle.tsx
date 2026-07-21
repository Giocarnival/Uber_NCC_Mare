import { View, Text, Image, StyleSheet } from "react-native";
import { colors, spacing } from "../constants/theme";

interface Props {
  subtitle?: string;
}

export function AppHeaderTitle({ subtitle }: Props) {
  return (
    <View style={styles.row}>
      <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
      <View>
        <Text style={styles.title}>SABAUDIA SHUTTLE</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logo: { width: 30, height: 26 },
  title: { color: colors.white, fontWeight: "800", fontSize: 15, letterSpacing: 0.3 },
  subtitle: { color: colors.white, opacity: 0.8, fontSize: 11, fontWeight: "600" },
});
