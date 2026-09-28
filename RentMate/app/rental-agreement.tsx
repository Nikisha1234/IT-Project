import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Button from "../components/Button";
import { colors } from "../constants/colors";

export default function RentalAgreement() {
  const { rentalId } = useLocalSearchParams();

  const [accepted, setAccepted] = useState(false);

  const continueToPayment = () => {
    if (!accepted) {
      Alert.alert(
        "Agreement Required",
        "Please accept the rental agreement before continuing.",
      );
      return;
    }

    router.push({
      pathname: "/rental-payment",
      params: {
        rentalId: String(rentalId),
      },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name="document-text-outline"
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.title}>Rental Agreement</Text>

      <Text style={styles.subtitle}>
        Please review the rental terms before continuing to payment.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1. Rental Period</Text>

        <Text style={styles.text}>
          The equipment must be used only during the selected rental period.
        </Text>

        <Text style={styles.sectionTitle}>2. Rental Fee</Text>

        <Text style={styles.text}>
          The customer is responsible for the rental fee shown in the rental
          summary.
        </Text>

        <Text style={styles.sectionTitle}>3. Security Deposit</Text>

        <Text style={styles.text}>
          The security deposit is held separately from the rental fee and is
          refundable after the equipment is successfully returned, subject to
          the rental conditions.
        </Text>

        <Text style={styles.sectionTitle}>4. Equipment Responsibility</Text>

        <Text style={styles.text}>
          The customer is responsible for taking reasonable care of the
          equipment during the rental period and returning it in acceptable
          condition.
        </Text>

        <Text style={styles.sectionTitle}>5. Damage or Loss</Text>

        <Text style={styles.text}>
          Damage or loss may affect the security deposit according to the
          agreement between the customer and equipment owner.
        </Text>

        <Text style={styles.sectionTitle}>6. Payment</Text>

        <Text style={styles.text}>
          Online payments in this college project use a test/sandbox payment
          flow. Cash on Hand requires confirmation from the equipment owner.
        </Text>
      </View>

      <Pressable
        style={styles.checkboxRow}
        onPress={() => setAccepted(!accepted)}
      >
        <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
          {accepted && (
            <Ionicons name="checkmark" size={18} color={colors.white} />
          )}
        </View>

        <Text style={styles.checkboxText}>
          I have read and agree to the RentEquip rental terms.
        </Text>
      </Pressable>

      <Button title="Continue to Payment" onPress={continueToPayment} />
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

  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    color: colors.secondaryText,
  },

  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
    marginBottom: 5,
  },

  text: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.secondaryText,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  checkboxActive: {
    backgroundColor: colors.primary,
  },

  checkboxText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
});
