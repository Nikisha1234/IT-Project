import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Button from "../components/Button";
import { colors } from "../constants/colors";
import {
  createRental,
  Equipment,
  getCitizenshipStatus,
  getEquipmentById,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
};

const displayDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

export default function RentalDetails() {
  const { equipmentId } = useLocalSearchParams();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  const [startText, setStartText] = useState(displayDate(new Date()));
  const [endText, setEndText] = useState(displayDate(new Date()));

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, [equipmentId]);

  const loadEquipment = async () => {
    try {
      setLoading(true);

      if (!equipmentId) {
        throw new Error("Equipment ID is missing");
      }

      const data = await getEquipmentById(Number(equipmentId));
      setEquipment(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load equipment.",
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    const difference = endDate.getTime() - startDate.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleStartDateChange = (_event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }

    setStartDate(selectedDate);
    setStartText(displayDate(selectedDate));

    if (selectedDate > endDate) {
      setEndDate(selectedDate);
      setEndText(displayDate(selectedDate));
    }
  };

  const handleEndDateChange = (_event: any, selectedDate?: Date) => {
    if (!selectedDate) {
      return;
    }

    setEndDate(selectedDate);
    setEndText(displayDate(selectedDate));
  };

  const openStartDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: startDate,
        mode: "date",
        display: "default",
        onValueChange: handleStartDateChange,
      });

      return;
    }

    setShowStartPicker(true);
  };

  const openEndDatePicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: endDate,
        mode: "date",
        display: "default",
        onValueChange: handleEndDateChange,
      });

      return;
    }

    setShowEndPicker(true);
  };

  const parseManualDate = (value: string): Date | null => {
    const parts = value.split("/");

    if (parts.length !== 3) {
      return null;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (
      !day ||
      !month ||
      !year ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return null;
    }

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  };

  const handleSubmit = async () => {
    if (!equipment) {
      return;
    }

    const parsedStart = parseManualDate(startText);
    const parsedEnd = parseManualDate(endText);

    if (!parsedStart || !parsedEnd) {
      Alert.alert("Invalid Date", "Please enter dates in DD/MM/YYYY format.");
      return;
    }

    if (parsedEnd < parsedStart) {
      Alert.alert(
        "Invalid Rental Period",
        "End date cannot be before start date.",
      );
      return;
    }

    const days =
      Math.floor(
        (parsedEnd.getTime() - parsedStart.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1;

    if (days <= 0) {
      Alert.alert("Invalid Rental Period", "Rental must be at least one day.");
      return;
    }

    try {
      setSubmitting(true);

      const customerEmail = await getCurrentUserEmail();

      if (!customerEmail) {
        Alert.alert("Login Required", "Please login again.");
        return;
      }

      const citizenshipProvided = await getCitizenshipStatus(customerEmail);

      if (!citizenshipProvided) {
        Alert.alert(
          "Citizenship Required",
          "Please provide your citizenship before renting equipment. This verification is required to use RentMate's rental service.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Provide Citizenship",
              onPress: () => {
                router.push("/citizenship");
              },
            },
          ],
        );

        return;
      }

      await createRental({
        equipmentId: equipment.id,
        customerEmail,
        startDate: formatDate(parsedStart),
        endDate: formatDate(parsedEnd),
      });

      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.replace("/(tabs)/rentals");
      }, 1800);
    } catch (error: any) {
      console.error("Rental request error:", error);

      const message = error?.message || "Unable to send the rental request.";

      if (
        message.toLowerCase().includes("citizenship") ||
        message.toLowerCase().includes("citizen")
      ) {
        Alert.alert(
          "Citizenship Required",
          "Please provide your citizenship before renting equipment.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Provide Citizenship",
              onPress: () => {
                router.push("/citizenship");
              },
            },
          ],
        );

        return;
      }

      Alert.alert("Rental Request Failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading equipment...</Text>
      </View>
    );
  }

  if (!equipment) {
    return (
      <View style={styles.center}>
        <Text>Equipment not found.</Text>
      </View>
    );
  }

  const days = calculateDays();
  const rentalFee = equipment.price * Math.max(days, 1);
  const securityDeposit = Number(equipment.securityDeposit || 0);
  const total = rentalFee + securityDeposit;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={submitting}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Rental Details</Text>
        </View>

        <View style={styles.equipmentCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={25} color={colors.primary} />
          </View>

          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentName}>{equipment.name}</Text>

            <Text style={styles.price}>Rs. {equipment.price}/day</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Select Rental Dates</Text>

        <Text style={styles.label}>Start Date</Text>

        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            value={startText}
            onChangeText={setStartText}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            editable={!submitting}
          />

          <Pressable
            style={styles.calendarButton}
            onPress={openStartDatePicker}
            disabled={submitting}
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {Platform.OS !== "android" && showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onValueChange={handleStartDateChange}
            onDismiss={() => setShowStartPicker(false)}
          />
        )}

        <Text style={styles.label}>End Date</Text>

        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            value={endText}
            onChangeText={setEndText}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
            editable={!submitting}
          />

          <Pressable
            style={styles.calendarButton}
            onPress={openEndDatePicker}
            disabled={submitting}
          >
            <Ionicons
              name="calendar-outline"
              size={21}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {Platform.OS !== "android" && showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onValueChange={handleEndDateChange}
            onDismiss={() => setShowEndPicker(false)}
          />
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Rental Summary</Text>

          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Rental Period</Text>

            <Text style={styles.summaryValue}>
              {days} {days === 1 ? "day" : "days"}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Rental Fee</Text>

            <Text style={styles.summaryValue}>
              Rs. {rentalFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.summaryLabel}>Security Deposit</Text>

            <Text style={styles.summaryValue}>
              Rs. {securityDeposit.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>Rs. {total.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.depositNote}>
          The security deposit is refundable after successful return, subject to
          the rental terms.
        </Text>

        <Button
          title={submitting ? "Sending Request..." : "Send Rental Request"}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScrollView>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={34} color={colors.white} />
            </View>

            <Text style={styles.successTitle}>Rental Request Sent</Text>

            <Text style={styles.successMessage}>
              Your rental request has been sent to the equipment owner.
            </Text>
          </View>
        </View>
      </Modal>
    </>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 10,
    color: colors.secondaryText,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },

  equipmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 25,
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  equipmentInfo: {
    flex: 1,
  },

  equipmentName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  price: {
    marginTop: 4,
    color: colors.primary,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 15,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 7,
  },

  dateRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  dateInput: {
    flex: 1,
    height: 50,
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
  },

  calendarButton: {
    width: 50,
    height: 50,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 18,
    marginTop: 10,
    marginBottom: 12,
  },

  summaryTitle: {
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

  summaryLabel: {
    color: colors.secondaryText,
    fontSize: 14,
  },

  summaryValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 5,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },

  depositNote: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.secondaryText,
    marginBottom: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  successModal: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },

  successIcon: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  successTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 10,
  },

  successMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.secondaryText,
    textAlign: "center",
  },
});
