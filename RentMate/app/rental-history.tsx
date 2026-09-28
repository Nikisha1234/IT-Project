import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import {
  getCustomerRentals,
  getEquipmentById,
  Rental,
  requestReturn,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

type RentalWithEquipment = Rental & {
  equipmentName?: string;
};

export default function RentalHistory() {
  const [rentals, setRentals] = useState<RentalWithEquipment[]>([]);

  const [loading, setLoading] = useState(true);

  const loadRentals = async () => {
    try {
      setLoading(true);

      const email = await getCurrentUserEmail();

      if (!email) {
        setRentals([]);
        return;
      }

      const data = await getCustomerRentals(email);

      const enriched = await Promise.all(
        data.map(async (rental) => {
          try {
            const equipment = await getEquipmentById(rental.equipmentId);

            return {
              ...rental,
              equipmentName: equipment.name,
            };
          } catch {
            return rental;
          }
        }),
      );

      setRentals([...enriched].sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error("Error loading rentals:", error);

      setRentals([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRentals();
    }, []),
  );

  const handleReturn = async (rental: Rental) => {
    Alert.alert(
      "Request Return",
      "Are you sure you want to request the return of this equipment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Request Return",
          onPress: async () => {
            try {
              await requestReturn(rental.id);

              Alert.alert(
                "Return Requested",
                "The equipment owner has been notified.",
              );

              loadRentals();
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to request return.",
              );
            }
          },
        },
      ],
    );
  };

  const getStatusText = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "Request Pending";

      case "PAYMENT_PENDING":
        return "Payment Required";

      case "ACTIVE":
        return "Active Rental";

      case "RETURN_REQUESTED":
        return "Return Requested";

      case "COMPLETED":
        return "Completed";

      case "CANCELLED":
        return "Cancelled";

      default:
        return status;
    }
  };

  const getStatusIcon = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "time-outline";

      case "PAYMENT_PENDING":
        return "card-outline";

      case "ACTIVE":
        return "play-circle-outline";

      case "RETURN_REQUESTED":
        return "return-up-back-outline";

      case "COMPLETED":
        return "checkmark-circle-outline";

      case "CANCELLED":
        return "close-circle-outline";

      default:
        return "information-circle-outline";
    }
  };

  const renderItem = ({ item }: { item: RentalWithEquipment }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={23}
            color={colors.primary}
          />
        </View>

        <View style={styles.info}>
          <Text style={styles.equipmentName}>
            {item.equipmentName || `Equipment #${item.equipmentId}`}
          </Text>

          <Text style={styles.date}>
            {item.startDate} → {item.endDate}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Rental Fee</Text>

        <Text style={styles.amount}>
          Rs. {Number(item.rentalFee).toLocaleString()}
        </Text>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>Security Deposit</Text>

        <Text style={styles.amount}>
          Rs. {Number(item.securityDeposit).toLocaleString()}
        </Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{getStatusText(item.status)}</Text>

        {item.status === "COMPLETED" && (
          <Text style={styles.refunded}>Deposit Refunded</Text>
        )}
      </View>

      {item.status === "PAYMENT_PENDING" && (
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.push({
              pathname: "/rental-agreement",
              params: {
                rentalId: String(item.id),
              },
            })
          }
        >
          <Ionicons name="card-outline" size={19} color={colors.white} />

          <Text style={styles.primaryButtonText}>Pay Now</Text>
        </Pressable>
      )}

      {item.status === "ACTIVE" && (
        <Pressable
          style={styles.primaryButton}
          onPress={() => handleReturn(item)}
        >
          <Ionicons
            name="return-up-back-outline"
            size={19}
            color={colors.white}
          />

          <Text style={styles.primaryButtonText}>Request Return</Text>
        </Pressable>
      )}

      {item.status === "RETURN_REQUESTED" && (
        <View style={styles.waitingBox}>
          <Ionicons name="time-outline" size={18} color={colors.primary} />

          <Text style={styles.waitingText}>
            Waiting for the owner to confirm the return.
          </Text>
        </View>
      )}

      {item.status === "CANCELLED" && (
        <View style={styles.cancelledBox}>
          <Text style={styles.cancelledText}>
            This rental request was cancelled.
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading your rentals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Rentals</Text>

        <Text style={styles.subtitle}>Your rental activity</Text>
      </View>

      <FlatList
        data={rentals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          rentals.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="calendar-outline"
                size={38}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No rentals yet</Text>

            <Text style={styles.emptyText}>
              Equipment you request will appear here.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <Text style={styles.exploreButtonText}>Explore Equipment</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    color: colors.secondaryText,
    fontSize: 13,
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  equipmentName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  date: {
    marginTop: 4,
    fontSize: 12,
    color: colors.secondaryText,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },

  amountLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },

  amount: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  statusRow: {
    marginTop: 15,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  refunded: {
    marginTop: 3,
    fontSize: 11,
    color: colors.success,
  },

  primaryButton: {
    marginTop: 14,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },

  waitingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    padding: 11,
    borderRadius: 10,
    marginTop: 14,
  },

  waitingText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: colors.text,
  },

  cancelledBox: {
    marginTop: 13,
    padding: 10,
    borderRadius: 9,
    backgroundColor: "#FDECEC",
  },

  cancelledText: {
    fontSize: 12,
    color: colors.danger,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    color: colors.secondaryText,
  },

  emptyList: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
  },

  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    color: colors.secondaryText,
  },

  exploreButton: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  exploreButtonText: {
    color: colors.white,
    fontWeight: "700",
  },
});
