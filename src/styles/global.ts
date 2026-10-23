import { StyleSheet } from "react-native";
import { Theme } from "./theme";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // Encabezado principal
  headerCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    padding: 20,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBadge: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: Theme.colors.textMuted,
    textTransform: "uppercase",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  btnPrimaryCompact: {
    backgroundColor: Theme.colors.surfaceSubtle,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  btnPrimaryText: {
    color: Theme.colors.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  btnSecondaryCompact: {
    backgroundColor: "transparent",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: Theme.radius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  btnSecondaryText: {
    color: Theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Resumen del portafolio dentro del Header
  portfolioSummaryRow: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  portfolioLabel: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  portfolioTotalValue: {
    fontSize: 26,
    fontWeight: "800",
    color: Theme.colors.textPrimary,
    marginTop: 2,
    fontVariant: ["tabular-nums"],
  },

  // Contenido y Watchlist
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  refreshText: {
    color: Theme.colors.accent,
    fontSize: 13,
    fontWeight: "600",
  },

  // Tarjeta de cada Acción
  stockCard: {
    backgroundColor: Theme.colors.surface,
    padding: 16,
    borderRadius: Theme.radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  stockLeftCol: {
    flex: 1,
  },
  tickerText: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  stockSubText: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 3,
  },
  stockRightCol: {
    alignItems: "flex-end",
    marginRight: 14,
  },
  stockPriceValue: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Theme.radius.sm,
    marginTop: 4,
  },
  badgeGain: {
    backgroundColor: Theme.colors.gainSoft,
  },
  badgeLoss: {
    backgroundColor: Theme.colors.lossSoft,
  },
  badgeTextGain: {
    color: Theme.colors.gain,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  badgeTextLoss: {
    color: Theme.colors.loss,
    fontSize: 12,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  deleteActionBtn: {
    padding: 8,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.colors.surfaceSubtle,
  },
  deleteActionText: {
    color: Theme.colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },

  // Modales
  modalContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
  },
  modalCloseText: {
    color: Theme.colors.accent,
    fontSize: 15,
    fontWeight: "600",
  },
  inputWrap: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.radius.md,
    paddingHorizontal: 14,
    height: 44,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },

  // Empty state
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: Theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    color: Theme.colors.textSecondary,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});
