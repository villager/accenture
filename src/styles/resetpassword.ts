import { StyleSheet } from "react-native";
import { Theme } from "./theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: Theme.colors.surface,
    padding: 24,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  title: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    height: 46,
    color: Theme.colors.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: Theme.colors.accent,
    height: 46,
    borderRadius: Theme.radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  submitBtnText: {
    color: Theme.colors.background,
    fontSize: 14,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
  },
});
