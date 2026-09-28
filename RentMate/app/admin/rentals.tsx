import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import { getAllAdminRentals } from "../../services/api";

type AdminRental = {
  id: number;
  equipmentId: number;
  customerEmail: string;
  ownerEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalAmount: number;
  status: string;
};

export default function AdminRentals() {
  const [rentals, setRentals] = useState<AdminRental[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRentals = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAllAdminRentals();

      setRentals(data);
    } catch (error) {
      console.error("Error loading rentals:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load rentals.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRentals();
  }, [loadRentals]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          backgroundColor: colors.primaryLight,
          textColor: colors.primary,
        };

      case "PENDING":
        return {
          backgroundColor: "#FFF4D6",
          textColor: "#A66A00",
        };

      case "RETURN_REQUESTED":
        return {
          backgroundColor: "#EDE7F6",
          textColor: colors.primary,
        };

      case "COMPLETED":
        return {
          backgroundColor: "#E8F5E9",
          textColor: "#2E7D32",
        };

      case "CANCELLED":
        return {
          backgroundColor: "#FDECEC",
          textColor: colors.danger,
        };

      default:
        return {
          backgroundColor: "#F3F3F3",
          textColor: colors.secondaryText,
        };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>

            <View style={styles.headerText}>
              <Text style={styles.title}>Manage Rentals</Text>
              <Text style={styles.subtitle}>
                Monitor all rental transactions
              </Text>
            </View>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Loading rentals...</Text>
        </View>
      ) : rentals.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="receipt-outline"
            size={50}
            color={colors.secondaryText}
          />

          <Text style={styles.emptyTitle}>No rentals found</Text>

          <Text style={styles.emptyText}>
            Rental transactions will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.countCard}>
            <Ionicons name="receipt-outline" size={25} color={colors.primary} />

            <View>
              <Text style={styles.countNumber}>{rentals.length}</Text>

              <Text style={styles.countLabel}>Total Rentals</Text>
            </View>
          </View>

          {rentals.map((rental) => {
            const statusStyle = getStatusStyle(rental.status);

            return (
              <View key={rental.id} style={styles.rentalCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.rentalIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={23}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.rentalTitleArea}>
                    <Text style={styles.rentalTitle}>Rental #{rental.id}</Text>

                    <Text style={styles.equipmentText}>
                      Equipment #{rental.equipmentId}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: statusStyle.backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusStyle.textColor,
                        },
                      ]}
                    >
                      {rental.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={colors.secondaryText}
                  />

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Customer</Text>

                    <Text style={styles.infoValue} numberOfLines={1}>
                      {rental.customerEmail}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="person-circle-outline"
                    size={17}
                    color={colors.secondaryText}
                  />

                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Owner</Text>

                    <Text style={styles.infoValue} numberOfLines={1}>
                      {rental.ownerEmail}
                    </Text>
                  </View>
                </View>

                <View style={styles.dateRow}>
                  <View style={styles.dateBox}>
                    <Text style={styles.infoLabel}>Start Date</Text>

                    <Text style={styles.dateValue}>{rental.startDate}</Text>
                  </View>

                  <View style={styles.dateBox}>
                    <Text style={styles.infoLabel}>End Date</Text>

                    <Text style={styles.dateValue}>{rental.endDate}</Text>
                  </View>
                </View>

                <View style={styles.summaryRow}>
                  <View>
                    <Text style={styles.infoLabel}>Duration</Text>

                    <Text style={styles.summaryValue}>
                      {rental.totalDays} day
                      {rental.totalDays !== 1 ? "s" : ""}
                    </Text>
                  </View>

                  <View style={styles.priceArea}>
                    <Text style={styles.infoLabel}>Total Price</Text>

                    <Text style={styles.price}>Rs. {rental.totalAmount}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: colors.text,
  },

  subtitle: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  content: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },

  countCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },

  countNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },

  countLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
  },

  rentalCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  rentalIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  rentalTitleArea: {
    flex: 1,
    marginLeft: 11,
  },

  rentalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  equipmentText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginLeft: 7,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 13,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  infoContent: {
    flex: 1,
    marginLeft: 8,
  },

  infoLabel: {
    fontSize: 10,
    color: colors.secondaryText,
  },

  infoValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
    marginTop: 2,
  },

  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 3,
  },

  dateBox: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 9,
    padding: 10,
  },

  dateValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
    marginTop: 3,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },

  summaryValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
    marginTop: 3,
  },

  priceArea: {
    alignItems: "flex-end",
  },

  price: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "bold",
    marginTop: 3,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 15,
  },

  emptyText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 5,
    textAlign: "center",
  },
});
