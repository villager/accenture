import { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import {
  AuthScreen,
  ResetPasswordModal,
  StockCardItem,
  StockDetailModal,
  StockSearchModal,
} from "../components/";
import { useWatchlist } from "../hooks/useWatchlist";
import { supabase } from "../services/supabase";
import { globalStyles as styles, Theme } from "../styles";
import { MarketStock, SearchStockResult } from "../types/stock";
import { parseSupabaseUrlTokens } from "../utils/authUrl";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleAuthDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;

    const { accessToken, refreshToken, type } = parseSupabaseUrlTokens(url);

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (!error && data.session) {
        setSession(data.session);
        if (type === "recovery") {
          setShowResetPassword(true);
        }
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === "PASSWORD_RECOVERY") {
        setShowResetPassword(true);
      }
    });

    Linking.getInitialURL().then(handleAuthDeepLink);

    const linkSubscription = Linking.addEventListener("url", (event) => {
      handleAuthDeepLink(event.url);
    });

    return () => {
      subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, [handleAuthDeepLink]);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Theme.colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      {!session ? <AuthScreen /> : <MainScreen />}

      <ResetPasswordModal
        visible={showResetPassword}
        onSuccess={() => setShowResetPassword(false)}
        onCancel={() => setShowResetPassword(false)}
      />
    </SafeAreaProvider>
  );
}

function MainScreen() {
  const {
    watchlist,
    marketData,
    loading,
    totalPortfolioValue,
    refreshPrices,
    addStock,
    removeStock,
  } = useWatchlist();

  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<MarketStock | null>(null);

  const handleAddStock = async (stock: SearchStockResult) => {
    const success = await addStock(stock);
    if (success) setSearchModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false, title: "" }} />

      {/* Institutional Overview Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerTopRow}>
          <Text style={styles.brandBadge}>TRACK & PREDICT</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.btnPrimaryCompact}
              onPress={() => setSearchModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnPrimaryText}>+ Search</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondaryCompact}
              onPress={() => supabase.auth.signOut()}
              activeOpacity={0.7}
            >
              <Text style={styles.btnSecondaryText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.portfolioSummaryRow}>
          <View>
            <Text style={styles.portfolioLabel}>ESTIMATED PORTFOLIO VALUE</Text>
            <Text style={styles.portfolioTotalValue}>
              $
              {totalPortfolioValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </View>
          <Text style={{ color: Theme.colors.textSecondary, fontSize: 13 }}>
            {watchlist.length} {watchlist.length === 1 ? "holding" : "holdings"}
          </Text>
        </View>
      </View>

      {/* Main Watchlist Section */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tracked Holdings</Text>
          <TouchableOpacity onPress={refreshPrices} disabled={loading}>
            <Text style={styles.refreshText}>
              {loading ? "Refreshing..." : "↻ Refresh"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && marketData.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent}
            style={{ marginTop: 40 }}
          />
        ) : marketData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No assets tracked</Text>
            <Text style={styles.emptySubtitle}>
              Tap the "+ Search" button above to track market equities in real
              time.
            </Text>
          </View>
        ) : (
          <FlatList<MarketStock>
            data={marketData}
            keyExtractor={(item) => item.ticker}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <StockCardItem
                item={item}
                onPress={() => {
                  setSelectedStock(item);
                  setDetailModalVisible(true);
                }}
                onDelete={() => removeStock(item.ticker)}
              />
            )}
          />
        )}
      </View>

      <StockDetailModal
        visible={detailModalVisible}
        stock={selectedStock}
        onClose={() => setDetailModalVisible(false)}
      />

      <StockSearchModal
        visible={searchModalVisible}
        watchlist={watchlist}
        onClose={() => setSearchModalVisible(false)}
        onAddStock={handleAddStock}
      />
    </SafeAreaView>
  );
}
