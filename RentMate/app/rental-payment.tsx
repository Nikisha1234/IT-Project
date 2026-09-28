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

import Button from "../components/Button";
import { colors } from "../constants/colors";
import {
    getRentalById,
    payRentalOnline,
    selectCashPayment,
} from "../services/api";

export default function RentalPayment() {
  const { rentalId } = useLocalSearchParams();

  const [rental, setRental] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">(
    "ONLINE",
  );

  useEffect(() => {
    loadRental();
  }, []);

  const loadRental = async () => {
    try {
      const data = await getRentalById(Number(rentalId));
      setRental(data);
    } catch (error) {
      Alert.alert("Error", "Unable to load payment information.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      let result;

      if (paymentMethod === "ONLINE") {
        result = await payRentalOnline(Number(rentalId), true);
      } else {
        result = await selectCashPayment(Number(rentalId), true);
      }

      if (paymentMethod === "ONLINE") {
        Alert.alert(
          "Payment Successful",
          `Test payment completed successfully.\n\nTransaction: ${result.transactionId}`,
          [
            {
              text: "View My Rentals",
              onPress: () => router.replace("/(tabs)/rentals"),
            },
          ],
        );
      } else {
        Alert.alert(
          "Cash Payment Selected",
          "Please give the payment to the equipment owner. Your rental will become active after the owner confirms the cash payment.",
          [
            {
              text: "OK",
              onPress: () => router.replace("/(tabs)/rentals"),
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Payment Error",
        error instanceof Error ? error.message : "Unable to complete payment.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (!rental) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Rental information not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Complete Payment</Text>

      <Text style={styles.subtitle}>
        Review your rental amount and choose a payment method.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Rental Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Rental Period</Text>
          <Text style={styles.value}>
            {rental.totalDays} {rental.totalDays === 1 ? "day" : "days"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Rental Fee</Text>
          <Text style={styles.value}>
            Rs. {Number(rental.rentalFee).toLocaleString()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Security Deposit</Text>
          <Text style={styles.value}>
            Rs. {Number(rental.securityDeposit).toLocaleString()}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>

          <Text style={styles.total}>
            Rs. {Number(rental.totalAmount).toLocaleString()}
          </Text>
        </View>
      </View>

      <Text style={styles.paymentTitle}>Payment Method</Text>

      <Pressable
        style={[
          styles.paymentOption,
          paymentMethod === "ONLINE" && styles.paymentOptionActive,
        ]}
        onPress={() => setPaymentMethod("ONLINE")}
      >
        <View style={styles.paymentIcon}>
          <Ionicons name="card-outline" size={23} color={colors.primary} />
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentName}>Online Payment</Text>

          <Text style={styles.paymentDescription}>Test/sandbox payment</Text>
        </View>

        <Ionicons
          name={
            paymentMethod === "ONLINE" ? "radio-button-on" : "radio-button-off"
          }
          size={22}
          color={colors.primary}
        />
      </Pressable>

      <Pressable
        style={[
          styles.paymentOption,
          paymentMethod === "CASH" && styles.paymentOptionActive,
        ]}
        onPress={() => setPaymentMethod("CASH")}
      >
        <View style={styles.paymentIcon}>
          <Ionicons name="cash-outline" size={23} color={colors.primary} />
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentName}>Cash on Hand</Text>

          <Text style={styles.paymentDescription}>
            Owner confirms cash received
          </Text>
        </View>

        <Ionicons
          name={
            paymentMethod === "CASH" ? "radio-button-on" : "radio-button-off"
          }
          size={22}
          color={colors.primary}
        />
      </Pressable>

      <View style={styles.notice}>
        <Ionicons
          name="shield-checkmark-outline"
          size={21}
          color={colors.primary}
        />

        <Text style={styles.noticeText}>
          Your security deposit is tracked separately and is marked for refund
          after successful return.
        </Text>
      </View>

      <Button
        title={
          processing
            ? "Processing..."
            : paymentMethod === "ONLINE"
              ? "Pay Now"
              : "Confirm Cash Payment"
        }
        onPress={handlePayment}
        loading={processing}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 25,
    paddingBottom: 40,
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

  errorText: {
    color: colors.danger,
    fontSize: 15,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 7,
    marginBottom: 20,
    color: colors.secondaryText,
    fontSize: 14,
    lineHeight: 20,
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 25,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: colors.secondaryText,
    fontSize: 14,
  },

  value: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  total: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  paymentTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },

  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  paymentOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  paymentIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  paymentInfo: {
    flex: 1,
  },

  paymentName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  paymentDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  notice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 13,
    marginTop: 8,
    marginBottom: 22,
  },

  noticeText: {
    flex: 1,
    marginLeft: 9,
    fontSize: 12,
    lineHeight: 18,
    color: colors.text,
  },
});
