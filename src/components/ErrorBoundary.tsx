import { Component, type ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { colors, spacing, typography } from "../constants/theme";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Cattura errori di rendering imprevisti (es. il loop infinito di
 * navigazione che ha causato un crash completo dell'app durante lo
 * sviluppo) e mostra una schermata di recupero invece di uno schermo
 * bianco/crash totale. Deve essere una class component: React non
 * supporta ancora gli error boundary tramite hook.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Qualcosa è andato storto</Text>
          <Text style={styles.message}>{this.state.error.message}</Text>
          <PrimaryButton label="Riprova" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.md,
    backgroundColor: colors.sand,
  },
  title: { fontSize: typography.heading.fontSize, fontWeight: "800", color: colors.danger },
  message: { color: colors.muted, textAlign: "center" },
});
