import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import {
  acceptRental,
  completeRental,
  confirmCashPayment,
  Equipment,
  getEquipmentById,
  getOwnerRentals,
  getRentalById,
  rejectRental,
  Rental,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

type RentalWithEquipment = Rental & {
  equipment?: Equipment;
};

export default function RentalRequest() {
  const params = useLocalSearchParams<{ id?: string }>();

  const [rental, setRental] = useState<RentalWithEquipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const loadRental = async () => {
    try {
      setLoading(true);

      const email = await getCurrentUserEmail();

      if (!email) {
        setRental(null);
        return;
      }

      let rentalData: Rental | null = null;

      if (params.id) {
        try {
          const rentalId = Number(params.id);

          console.log("Loading rental ID:", rentalId);

          rentalData = await getRentalById(rentalId);

          console.log("Rental received from API:", rentalData);
          console.log("Equipment ID received:", rentalData.equipmentId);
        } catch (error) {
          console.error("Error loading selected rental:", error);
        }
      }

      if (!rentalData) {
        const ownerRentals = await getOwnerRentals(email);

        if (ownerRentals.length > 0) {
          const sortedRentals = [...ownerRentals].sort((a, b) => b.id - a.id);

          rentalData = sortedRentals[0];

          console.log("Fallback rental received:", rentalData);
          console.log("Fallback equipment ID:", rentalData.equipmentId);
        }
      }

      if (!rentalData) {
        setRental(null);
        return;
      }

      if (
        rentalData.ownerEmail &&
        rentalData.ownerEmail.toLowerCase() !== email.toLowerCase()
      ) {
        Alert.alert(
          "Access Denied",
          "This rental request does not belong to your equipment.",
        );

        setRental(null);
        return;
      }

      let equipment: Equipment | undefined;

      try {
        console.log("Loading equipment ID:", rentalData.equipmentId);

        equipment = await getEquipmentById(rentalData.equipmentId);

        console.log("Equipment received from API:", equipment);
      } catch (error) {
        console.error(
          "Error loading equipment:",
          rentalData.equipmentId,
          error,
        );
      }

      setRental({
        ...rentalData,
        equipment,
      });
    } catch (error) {
      console.error("Error loading rental request:", error);

      setRental(null);

      Alert.alert("Error", "Unable to load the rental request.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRental();
    }, [params.id]),
  );

  const handleAccept = async () => {
    if (!rental) return;

    try {
      setProcessing(true);

      await acceptRental(rental.id);

      Alert.alert(
        "Request Accepted",
        "The customer has been notified to complete the payment.",
      );

      await loadRental();
    } catch (error) {
      console.error("Accept error:", error);

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to accept rental request.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    if (!rental) return;

    Alert.alert(
      "Reject Request",
      "Are you sure you want to reject this rental request?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);

              await rejectRental(rental.id);

              Alert.alert(
                "Request Rejected",
                "The rental request has been rejected.",
              );

              await loadRental();
            } catch (error) {
              console.error("Reject error:", error);

              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to reject request.",
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleConfirmCash = async () => {
    if (!rental) return;

    try {
      setProcessing(true);

      await confirmCashPayment(rental.id);

      Alert.alert(
        "Payment Confirmed",
        "Cash payment has been confirmed and the rental is now active.",
      );

      await loadRental();
    } catch (error) {
      console.error("Confirm cash error:", error);

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to confirm cash payment.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCompleteReturn = () => {
    if (!rental) return;

    Alert.alert(
      "Confirm Return",
      "Confirm that the equipment has been returned successfully?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setProcessing(true);

              await completeRental(rental.id);

              Alert.alert(
                "Return Completed",
                "The equipment is now available again.",
              );

              await loadRental();
            } catch (error) {
              console.error("Complete return error:", error);

              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to complete return.",
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const getStatusLabel = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "NEW REQUEST";

      case "PAYMENT_PENDING":
        return "PAYMENT PENDING";

      case "CASH_PENDING":
        return "CASH PAYMENT PENDING";

      case "ACTIVE":
        return "ACTIVE RENTAL";

      case "RETURN_REQUESTED":
        return "RETURN REQUESTED";

      case "COMPLETED":
        return "COMPLETED";

      case "CANCELLED":
        return "CANCELLED";

      default:
        return String(status).replace("_", " ");
    }
  };

  const getStatusText = (status: Rental["status"]) => {
    switch (status) {
      case "PENDING":
        return "Waiting for your approval.";

      case "PAYMENT_PENDING":
        return "Waiting for the customer to complete payment.";

      case "CASH_PENDING":
        return "The customer selected Cash on Hand. Confirm after receiving the cash.";

      case "ACTIVE":
        return "The equipment is currently rented.";

      case "RETURN_REQUESTED":
        return "The customer has requested to return the equipment.";

      case "COMPLETED":
        return "This rental has been completed successfully.";

      case "CANCELLED":
        return "This rental request has been cancelled.";

      default:
        return status;
    }
  };

  const getStatusIcon = (
    status: Rental["status"],
  ): React.ComponentProps<typeof Ionicons>["name"] => {
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Rental Request</Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Loading rental request...</Text>
        </View>
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={23} color={colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Rental Request</Text>

          <View style={styles.headerSpace} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="document-text-outline"
              size={42}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>Rental Request Not Found</Text>

          <Text style={styles.emptyText}>
            This rental request could not be loaded.
          </Text>
        </View>
      </View>
    );
  }

  const equipmentName =
    rental.equipment?.name || `Equipment #${rental.equipmentId}`;

  const isProcessing = processing;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Rental Request</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.mainCard,
            rental.status === "PENDING" && styles.newCard,
            rental.status === "RETURN_REQUESTED" && styles.returnCard,
            rental.status === "COMPLETED" && styles.completedCard,
            rental.status === "CANCELLED" && styles.cancelledCard,
          ]}
        >
          <View style={styles.equipmentHeader}>
            <View style={styles.equipmentIcon}>
              <Ionicons name="cube-outline" size={28} color={colors.primary} />
            </View>

            <View style={styles.equipmentInfo}>
              <Text style={styles.equipmentName}>{equipmentName}</Text>

              <Text style={styles.requestedBy}>Rental Request</Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              rental.status === "PENDING" && styles.pendingBadge,
              rental.status === "PAYMENT_PENDING" && styles.paymentBadge,
              rental.status === "CASH_PENDING" && styles.cashBadge,
              rental.status === "ACTIVE" && styles.activeBadge,
              rental.status === "RETURN_REQUESTED" && styles.returnBadge,
              rental.status === "COMPLETED" && styles.completedBadge,
              rental.status === "CANCELLED" && styles.cancelledBadge,
            ]}
          >
            <Ionicons
              name={getStatusIcon(rental.status)}
              size={17}
              color={colors.primary}
            />

            <Text style={styles.statusBadgeText}>
              {getStatusLabel(rental.status)}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={colors.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Customer</Text>

                <Text style={styles.infoValue}>{rental.customerEmail}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rental Details</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Start Date</Text>

                <Text style={styles.detailValue}>{rental.startDate}</Text>
              </View>

              <View style={styles.detailItemRight}>
                <Text style={styles.detailLabel}>End Date</Text>

                <Text style={styles.detailValue}>{rental.endDate}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>

                <Text style={styles.detailValue}>
                  {rental.totalDays} {rental.totalDays === 1 ? "day" : "days"}
                </Text>
              </View>

              <View style={styles.detailItemRight}>
                <Text style={styles.detailLabel}>Payment Method</Text>

                <Text style={styles.detailValue}>
                  {rental.paymentMethod === "CASH"
                    ? "Cash on Hand"
                    : rental.paymentMethod === "ONLINE"
                      ? "Online"
                      : "Not Selected"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Rental Fee</Text>

              <Text style={styles.amountValue}>
                Rs. {(rental.rentalFee ?? 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Security Deposit</Text>

              <Text style={styles.amountValue}>
                Rs. {(rental.securityDeposit ?? 0).toLocaleString()}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>

              <Text style={styles.totalValue}>
                Rs. {(rental.totalAmount ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>

          <View style={styles.statusMessage}>
            <View style={styles.statusMessageIcon}>
              <Ionicons
                name={getStatusIcon(rental.status)}
                size={20}
                color={colors.primary}
              />
            </View>

            <View style={styles.statusMessageContent}>
              <Text style={styles.statusMessageTitle}>
                {getStatusLabel(rental.status)}
              </Text>

              <Text style={styles.statusMessageText}>
                {getStatusText(rental.status)}
              </Text>
            </View>
          </View>

          {rental.status === "PENDING" && (
            <View style={styles.actions}>
              <Pressable
                style={styles.rejectButton}
                onPress={handleReject}
                disabled={isProcessing}
              >
                <Text style={styles.rejectText}>Reject</Text>
              </Pressable>

              <Pressable
                style={styles.acceptButton}
                onPress={handleAccept}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={18} color={colors.white} />

                    <Text style={styles.acceptText}>Accept</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {rental.status === "PAYMENT_PENDING" && (
            <View style={styles.waitingBox}>
              <Ionicons name="card-outline" size={20} color={colors.primary} />

              <Text style={styles.waitingText}>
                The customer must complete payment before this rental becomes
                active.
              </Text>
            </View>
          )}

          {rental.status === "CASH_PENDING" && (
            <View style={styles.cashBox}>
              <View style={styles.cashInfo}>
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={colors.primary}
                />

                <Text style={styles.waitingText}>
                  The customer selected Cash on Hand. Confirm the payment after
                  receiving the cash.
                </Text>
              </View>

              <Pressable
                style={styles.acceptButton}
                onPress={handleConfirmCash}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.acceptText}>Payment Received</Text>
                )}
              </Pressable>
            </View>
          )}

          {rental.status === "RETURN_REQUESTED" && (
            <Pressable
              style={styles.acceptButton}
              onPress={handleCompleteReturn}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done"
                    size={18}
                    color={colors.white}
                  />

                  <Text style={styles.acceptText}>Confirm Return</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  headerSpace: {
    width: 40,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  mainCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 17,
    borderWidth: 1,
    borderColor: colors.border,
  },

  newCard: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  returnCard: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  completedCard: {
    opacity: 0.88,
  },

  cancelledCard: {
    opacity: 0.78,
  },

  equipmentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  equipmentInfo: {
    flex: 1,
  },

  equipmentName: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.text,
  },

  requestedBy: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 4,
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 15,
    gap: 5,
    backgroundColor: colors.primaryLight,
  },

  pendingBadge: {
    backgroundColor: colors.primaryLight,
  },

  paymentBadge: {
    backgroundColor: colors.primaryLight,
  },

  cashBadge: {
    backgroundColor: colors.primaryLight,
  },

  activeBadge: {
    backgroundColor: colors.primaryLight,
  },

  returnBadge: {
    backgroundColor: colors.primaryLight,
  },

  completedBadge: {
    backgroundColor: colors.primaryLight,
  },

  cancelledBadge: {
    backgroundColor: colors.primaryLight,
  },

  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.3,
  },

  section: {
    marginTop: 20,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 11,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
  },

  detailItem: {
    flex: 1,
  },

  detailItemRight: {
    flex: 1,
    alignItems: "flex-end",
  },

  detailLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginBottom: 4,
  },

  detailValue: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 1,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },

  amountLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },

  amountValue: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 7,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  statusMessage: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },

  statusMessageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  statusMessageContent: {
    flex: 1,
  },

  statusMessageTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },

  statusMessageText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 2,
    lineHeight: 17,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 15,
  },

  rejectButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  rejectText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },

  acceptButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
  },

  acceptText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },

  waitingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
    gap: 9,
  },

  cashBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 15,
  },

  cashInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 0,
  },

  waitingText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 10,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 7,
    textAlign: "center",
  },

  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 21,
  },
});
