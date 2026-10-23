import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { globalStyles as styles } from "../styles/index";
import { MarketStock } from "../types/stock";

interface Props {
  item: MarketStock;
  onPress: () => void;
  onDelete: () => void;
}

export const StockCardItem = React.memo(
  ({ item, onPress, onDelete }: Props) => {
    const isPositive = item.change >= 0;

    return (
      <TouchableOpacity
        style={styles.stockCard}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.stockLeftCol}>
          <Text style={styles.tickerText}>{item.ticker}</Text>
          <Text style={styles.stockSubText} numberOfLines={1}>
            {item.shares} {item.shares === 1 ? "share" : "shares"} • $
            {item.price.toFixed(2)}
          </Text>
        </View>

        <View style={styles.stockRightCol}>
          <Text style={styles.stockPriceValue}>
            ${item.totalValue.toFixed(2)}
          </Text>
          <View
            style={[
              styles.badgePill,
              isPositive ? styles.badgeGain : styles.badgeLoss,
            ]}
          >
            <Text
              style={isPositive ? styles.badgeTextGain : styles.badgeTextLoss}
            >
              {isPositive ? "+" : ""}
              {item.change.toFixed(2)}%
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteActionBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Text style={styles.deleteActionText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
);
