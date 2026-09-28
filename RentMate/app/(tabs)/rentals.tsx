import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import {
  getCustomerRentals,
  getEquipmentById,
  Rental,
  requestReturn,
} from "../../services/api";
import { getCurrentUserEmail } from "../../services/authStorage";

type RentalWithEquipment = Rental & { equipmentName: string };

export default function Rentals() {
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

      const rentalData = await getCustomerRentals(email);

      const rentalsWithEquipment = await Promise.all(
        rentalData.map(async (rental) => {
          try {
            const equipment = await getEquipmentById(rental.equipmentId);

            return {
              ...rental,
              equipmentName: equipment.name,
            };
          } catch (error) {
            console.error(
              `Unable to load equipment ${rental.equipmentId}:`,
              error,
            );

            return {
              ...rental,
              equipmentName: `Equipment #${rental.equipmentId}`,
            };
          }
        }),
      );

      setRentals(rentalsWithEquipment);
    } catch (error) {
      console.error("Error loading rentals:", error);

      setRentals([]);

      Alert.alert("Error", "Unable to load your rentals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRentals();
    }, []),
  );

  const handleRequestReturn = (rental: RentalWithEquipment) => {
    Alert.alert(
      "Request Return",
      `Are you sure you want to request the return of "${rental.equipmentName}"?`,
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
                "Your return request has been sent to the owner.",
              );

              await loadRentals();
            } catch (error) {
              console.error("Error requesting return:", error);

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

  const handlePayNow = (rental: RentalWithEquipment) => {
    if (rental.status !== "PAYMENT_PENDING") {
      return;
    }

    router.push({
      pathname: "/payment",
      params: {
        rentalId: String(rental.id),
      },
    });
  };

  const openRental = (rental: RentalWithEquipment) => {
    if (rental.status === "PAYMENT_PENDING") {
      handlePayNow(rental);
      return;
    }

    if (rental.status === "CASH_PENDING") {
      router.push({
        pathname: "/rental-details",
        params: {
          rentalId: String(rental.id),
        },
      });
      return;
    }

    router.push({
      pathname: "/rental-details",
      params: {
        rentalId: String(rental.id),
      },
    });
  };

  const paymentRequired = rentals.filter(
    (rental) => rental.status === "PAYMENT_PENDING",
  );

  const currentlyRented = rentals.filter(
    (rental) =>
      rental.status === "ACTIVE" || rental.status === "RETURN_REQUESTED",
  );

  const rentalRequests = rentals.filter(
    (rental) => rental.status === "PENDING" || rental.status === "CASH_PENDING",
  );

  const pastHistory = rentals.filter(
    (rental) => rental.status === "COMPLETED" || rental.status === "CANCELLED",
  );

  const sections = [
    {
      title: "Payment Required",
      data: paymentRequired,
    },
    {
      title: "Currently Rented",
      data: currentlyRented,
    },
    {
      title: "Rental Requests",
      data: rentalRequests,
    },
    {
      title: "Past History",
      data: pastHistory,
    },
  ];

  const getStatusIcon = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "time-outline";

      case "PAYMENT_PENDING":
        return "card-outline";

      case "CASH_PENDING":
        return "cash-outline";

      case "ACTIVE":
        return "checkmark-circle-outline";

      case "RETURN_REQUESTED":
        return "return-up-back-outline";

      case "COMPLETED":
        return "checkmark-done-outline";

      case "CANCELLED":
        return "close-circle-outline";

      default:
        return "information-circle-outline";
    }
  };

  const getStatusText = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "Rental request pending";

      case "PAYMENT_PENDING":
        return "Payment required";

      case "CASH_PENDING":
        return "Waiting for owner to confirm cash payment";

      case "ACTIVE":
        return "Rental active";

      case "RETURN_REQUESTED":
        return "Return requested";

      case "COMPLETED":
        return "Rental completed";

      case "CANCELLED":
        return "Rental cancelled";

      default:
        return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading your rentals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View>
          <Text style={styles.title}>My Rentals</Text>
        </View>
      </View>

      {rentals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="calendar-outline"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>No rentals yet</Text>

            <Text style={styles.empty}>
              You haven't rented any equipment yet.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() => router.push("/(tabs)/explore")}
            >
              <Text style={styles.exploreButtonText}>Explore Equipment</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => {
            if (section.data.length === 0) {
              return null;
            }

            return <Text style={styles.sectionHeader}>{section.title}</Text>;
          }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => openRental(item)}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name={getStatusIcon(item.status) as any}
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.itemName}>{item.equipmentName}</Text>

                <Text
                  style={[
                    styles.status,
                    item.status === "CANCELLED" && styles.cancelledStatus,
                  ]}
                >
                  {getStatusText(item.status)}
                </Text>

                <Text style={styles.itemDetail}>
                  {item.startDate} → {item.endDate}
                </Text>

                <Text style={styles.itemDetail}>
                  {item.totalDays} {item.totalDays === 1 ? "day" : "days"} •
                  Rental Fee: Rs. {(item.rentalFee ?? 0).toLocaleString()}
                </Text>

                <Text style={styles.itemDetail}>
                  Security Deposit: Rs.{" "}
                  {(item.securityDeposit ?? 0).toLocaleString()}
                </Text>

                <Text style={styles.totalText}>
                  Total: Rs. {(item.totalAmount ?? 0).toLocaleString()}
                </Text>

                {item.status === "PAYMENT_PENDING" && (
                  <View style={styles.paymentBox}>
                    <View style={styles.paymentInfo}>
                      <Ionicons
                        name="card-outline"
                        size={20}
                        color={colors.primary}
                      />

                      <View style={styles.paymentTextContainer}>
                        <Text style={styles.paymentTitle}>
                          Payment required
                        </Text>

                        <Text style={styles.paymentDescription}>
                          Your rental request was accepted. Complete payment to
                          activate the rental.
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      style={styles.payButton}
                      onPress={(event) => {
                        event.stopPropagation();
                        handlePayNow(item);
                      }}
                    >
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </Pressable>
                  </View>
                )}

                {item.status === "PENDING" && (
                  <View style={styles.infoBox}>
                    <Ionicons
                      name="time-outline"
                      size={18}
                      color={colors.primary}
                    />

                    <Text style={styles.infoText}>
                      Waiting for the owner to accept or reject your request.
                    </Text>
                  </View>
                )}

                {item.status === "CASH_PENDING" && (
                  <View style={styles.infoBox}>
                    <Ionicons
                      name="cash-outline"
                      size={18}
                      color={colors.primary}
                    />

                    <Text style={styles.infoText}>
                      Cash payment selected. Waiting for the owner to confirm
                      payment.
                    </Text>
                  </View>
                )}

                {item.status === "ACTIVE" && (
                  <Pressable
                    style={styles.returnButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      handleRequestReturn(item);
                    }}
                  >
                    <Text style={styles.returnButtonText}>Request Return</Text>
                  </Pressable>
                )}

                {item.status === "RETURN_REQUESTED" && (
                  <View style={styles.returnPendingBox}>
                    <Ionicons
                      name="time-outline"
                      size={17}
                      color={colors.primary}
                    />

                    <Text style={styles.returnPendingText}>
                      Waiting for owner to confirm return
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 55,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: colors.text,
  },

  listContent: {
    paddingBottom: 30,
  },

  sectionHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.secondaryText,
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },

  status: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 5,
  },

  cancelledStatus: {
    color: colors.danger,
  },

  itemDetail: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 3,
  },

  totalText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 7,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 11,
    marginTop: 12,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    lineHeight: 17,
    color: colors.primary,
    fontWeight: "600",
  },

  paymentBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
  },

  paymentInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  paymentTextContainer: {
    flex: 1,
    marginLeft: 9,
  },

  paymentTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },

  paymentDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.secondaryText,
    marginTop: 3,
  },

  payButton: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 10,
  },

  payButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 13,
  },

  returnButton: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },

  returnButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },

  returnPendingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primaryLight,
    borderRadius: 9,
    padding: 10,
    marginTop: 12,
  },

  returnPendingText: {
    flex: 1,
    color: colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingBottom: 50,
  },

  emptyBox: {
    alignItems: "center",
  },

  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 6,
  },

  empty: {
    textAlign: "center",
    color: colors.secondaryText,
    fontSize: 14,
  },

  exploreButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 18,
  },

  exploreButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
});
