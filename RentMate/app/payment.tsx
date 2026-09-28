import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
  cancelRentalPayment,
  getEquipmentById,
  getRentalById,
  payRentalOnline,
  Rental,
  selectCashPayment,
} from "../services/api";

export default function Payment() {
  const params = useLocalSearchParams<{ rentalId?: string }>();

  const rentalId = Number(params.rentalId);

  const [rental, setRental] = useState<Rental | null>(null);
  const [equipmentName, setEquipmentName] = useState("Equipment");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    loadRental();
  }, []);

  const loadRental = async () => {
    try {
      if (!rentalId || Number.isNaN(rentalId)) {
        Alert.alert("Error", "Invalid rental information.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        return;
      }

      const rentalData = await getRentalById(rentalId);
      setRental(rentalData);

      try {
        const equipment = await getEquipmentById(rentalData.equipmentId);
        setEquipmentName(equipment.name);
      } catch {
        setEquipmentName(`Equipment #${rentalData.equipmentId}`);
      }
    } catch (error) {
      console.error("Error loading payment:", error);

      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Unable to load payment information.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!rental) {
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        "Agreement Required",
        "Please read and accept the rental agreement before continuing.",
      );
      return;
    }

    Alert.alert(
      "Confirm Payment",
      `Your payment of Rs. ${rental.totalAmount.toLocaleString()} is ready to be processed.\n\nPlease confirm to continue.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm Payment",
          onPress: async () => {
            try {
              setProcessing(true);

              await payRentalOnline(rental.id, true);

              Alert.alert(
                "Payment Successful",
                `Your payment of Rs. ${rental.totalAmount.toLocaleString()} has been processed successfully.\n\nYour rental is now active.`,
                [
                  {
                    text: "View My Rentals",
                    onPress: () => {
                      router.replace("/(tabs)/rentals");
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Online payment error:", error);

              Alert.alert(
                "Payment Failed",
                error instanceof Error
                  ? error.message
                  : "Unable to complete payment.",
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleCashPayment = async () => {
    if (!rental) {
      return;
    }

    if (!termsAccepted) {
      Alert.alert(
        "Agreement Required",
        "Please read and accept the rental agreement before continuing.",
      );
      return;
    }

    Alert.alert(
      "Cash on Hand",
      "You have selected Cash on Hand. The owner will confirm the cash payment when the equipment is handed over.",
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

              await selectCashPayment(rental.id, true);

              Alert.alert(
                "Cash Payment Selected",
                "Your rental is waiting for the owner's cash payment confirmation.",
                [
                  {
                    text: "View My Rentals",
                    onPress: () => {
                      router.replace("/(tabs)/rentals");
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Cash payment error:", error);

              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to select cash payment.",
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleCancelRental = () => {
    if (!rental) {
      return;
    }

    Alert.alert(
      "Cancel Rental",
      "Are you sure you want to cancel this rental? This action cannot be undone.",
      [
        {
          text: "Keep Rental",
          style: "cancel",
        },
        {
          text: "Cancel Rental",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessing(true);

              await cancelRentalPayment(rental.id);

              Alert.alert(
                "Rental Cancelled",
                "Your rental request has been cancelled successfully.",
                [
                  {
                    text: "View My Rentals",
                    onPress: () => {
                      router.replace("/(tabs)/rentals");
                    },
                  },
                ],
              );
            } catch (error) {
              console.error("Cancel rental error:", error);

              Alert.alert(
                "Unable to Cancel",
                error instanceof Error
                  ? error.message
                  : "Unable to cancel the rental.",
              );
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading payment information...</Text>
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color={colors.danger} />

        <Text style={styles.errorTitle}>Unable to load rental</Text>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable
          style={styles.backIcon}
          onPress={() => router.back()}
          disabled={processing}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View>
          <Text style={styles.title}>Payment</Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.equipmentIcon}>
            <Ionicons name="cube-outline" size={24} color={colors.primary} />
          </View>

          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentLabel}>Equipment</Text>

            <Text style={styles.equipmentName}>{equipmentName}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rental Period</Text>

          <Text style={styles.detailValue}>
            {rental.startDate} → {rental.endDate}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Days</Text>

          <Text style={styles.detailValue}>
            {rental.totalDays} {rental.totalDays === 1 ? "day" : "days"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Rental Fee</Text>

          <Text style={styles.amountValue}>
            Rs. {rental.rentalFee.toLocaleString()}
          </Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Security Deposit</Text>

          <Text style={styles.amountValue}>
            Rs. {rental.securityDeposit.toLocaleString()}
          </Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>

          <Text style={styles.totalValue}>
            Rs. {rental.totalAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      <View style={styles.agreementCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons
            name="document-text-outline"
            size={21}
            color={colors.primary}
          />

          <Text style={styles.sectionTitle}>Rental Agreement</Text>
        </View>

        <Text style={styles.agreementIntro}>
          Please review the rental terms before completing your payment.
        </Text>

        <View style={styles.termRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colors.primary}
          />

          <Text style={styles.termText}>
            You agree to rent the equipment for the selected dates.
          </Text>
        </View>

        <View style={styles.termRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colors.primary}
          />

          <Text style={styles.termText}>
            The rental fee must be paid according to the selected payment
            method.
          </Text>
        </View>

        <View style={styles.termRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colors.primary}
          />

          <Text style={styles.termText}>
            The security deposit is held during the rental and is refundable
            after successful return, subject to the rental terms.
          </Text>
        </View>

        <View style={styles.termRow}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colors.primary}
          />

          <Text style={styles.termText}>
            You are responsible for returning the equipment in good condition.
            Damage or loss may affect the security deposit.
          </Text>
        </View>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setTermsAccepted((previous) => !previous)}
          disabled={processing}
        >
          <View
            style={[styles.checkbox, termsAccepted && styles.checkboxSelected]}
          >
            {termsAccepted && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>

          <Text style={styles.checkboxText}>
            I agree to the RentMate rental terms and conditions.
          </Text>
        </Pressable>
      </View>

      <View style={styles.paymentCard}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="card-outline" size={21} color={colors.primary} />

          <Text style={styles.sectionTitle}>Payment Method</Text>
        </View>

        <Text style={styles.paymentDescription}>
          Choose how you want to complete your rental payment.
        </Text>

        <Pressable
          style={[
            styles.paymentOption,
            !termsAccepted && styles.disabledOption,
          ]}
          onPress={handleOnlinePayment}
          disabled={processing}
        >
          <View style={styles.paymentOptionIcon}>
            <Ionicons name="card-outline" size={24} color={colors.primary} />
          </View>

          <View style={styles.paymentOptionContent}>
            <Text style={styles.paymentOptionTitle}>Online Payment</Text>

            <Text style={styles.paymentOptionText}>Secure online payment</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.secondaryText}
          />
        </Pressable>

        <Pressable
          style={[
            styles.paymentOption,
            !termsAccepted && styles.disabledOption,
          ]}
          onPress={handleCashPayment}
          disabled={processing}
        >
          <View style={styles.paymentOptionIcon}>
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
          </View>

          <View style={styles.paymentOptionContent}>
            <Text style={styles.paymentOptionTitle}>Cash on Hand</Text>

            <Text style={styles.paymentOptionText}>
              Pay the owner when receiving the equipment
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.secondaryText}
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.cancelRentalButton}
        onPress={handleCancelRental}
        disabled={processing}
      >
        <Ionicons name="close-circle-outline" size={20} color={colors.danger} />

        <Text style={styles.cancelRentalText}>Cancel Rental</Text>
      </Pressable>

      {processing && (
        <View style={styles.processingBox}>
          <ActivityIndicator size="small" color={colors.primary} />

          <Text style={styles.processingText}>Processing your request...</Text>
        </View>
      )}

      <View style={styles.noticeBox}>
        <Ionicons
          name="information-circle-outline"
          size={19}
          color={colors.primary}
        />

        <Text style={styles.noticeText}>
          Online payment is currently simulated for the RentMate project. No
          real money is charged.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 20,
    paddingTop: 55,
    paddingBottom: 40,
  },

  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 9,
  },

  backButtonText: {
    color: colors.white,
    fontWeight: "bold",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  equipmentInfo: {
    flex: 1,
  },

  equipmentLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },

  equipmentName: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },

  detailLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },

  detailValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "500",
    textAlign: "right",
    maxWidth: 210,
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  amountLabel: {
    fontSize: 13,
    color: colors.secondaryText,
  },

  amountValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
  },

  totalValue: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.primary,
  },

  agreementCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },

  agreementIntro: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.secondaryText,
    marginBottom: 12,
  },

  termRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },

  termText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.secondaryText,
    marginLeft: 8,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  checkboxSelected: {
    backgroundColor: colors.primary,
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
    fontWeight: "500",
  },

  paymentCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  paymentDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 12,
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    padding: 13,
    marginTop: 9,
  },

  disabledOption: {
    opacity: 0.55,
  },

  paymentOptionIcon: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  paymentOptionContent: {
    flex: 1,
  },

  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },

  paymentOptionText: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 3,
    lineHeight: 15,
  },

  cancelRentalButton: {
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 11,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
  },

  cancelRentalText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "bold",
  },

  processingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },

  processingText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.secondaryText,
  },

  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
  },

  noticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: colors.secondaryText,
    marginLeft: 8,
  },
});
