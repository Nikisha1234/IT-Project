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
import { deleteAdminEquipment, getAllAdminEquipment } from "../../services/api";

type AdminEquipment = {
  id: number;
  name: string;
  category: string;
  price: number;
  location: string;
  description: string;
  available: boolean;
  ownerEmail: string;
};

export default function AdminEquipment() {
  const [equipment, setEquipment] = useState<AdminEquipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEquipment = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAllAdminEquipment();

      setEquipment(data);
    } catch (error) {
      console.error("Error loading equipment:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load equipment.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEquipment();
  }, [loadEquipment]);

  const handleDelete = (item: AdminEquipment) => {
    Alert.alert(
      "Delete Equipment",
      `Are you sure you want to delete "${item.name}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAdminEquipment(item.id);

              Alert.alert("Success", "Equipment deleted successfully.");

              loadEquipment();
            } catch (error) {
              console.error("Error deleting equipment:", error);

              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to delete equipment.",
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Manage Equipment</Text>
          <Text style={styles.subtitle}>View and manage all equipment</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading equipment...</Text>
        </View>
      ) : equipment.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="cube-outline"
            size={50}
            color={colors.secondaryText}
          />

          <Text style={styles.emptyTitle}>No equipment found</Text>

          <Text style={styles.emptyText}>
            Equipment listed by users will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.countCard}>
            <Ionicons name="cube-outline" size={25} color={colors.primary} />

            <View>
              <Text style={styles.countNumber}>{equipment.length}</Text>

              <Text style={styles.countLabel}>Total Equipment</Text>
            </View>
          </View>

          {equipment.map((item) => (
            <View key={item.id} style={styles.equipmentCard}>
              <View style={styles.topRow}>
                <View style={styles.equipmentIcon}>
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color={colors.primary}
                  />
                </View>

                <View style={styles.mainInfo}>
                  <Text style={styles.equipmentName}>{item.name}</Text>

                  <Text style={styles.category}>{item.category}</Text>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                  />
                </Pressable>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Ionicons
                    name="cash-outline"
                    size={17}
                    color={colors.secondaryText}
                  />

                  <Text style={styles.detailText}>Rs. {item.price} / day</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons
                    name="location-outline"
                    size={17}
                    color={colors.secondaryText}
                  />

                  <Text style={styles.detailText}>{item.location}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Ionicons
                    name="person-outline"
                    size={17}
                    color={colors.secondaryText}
                  />

                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.ownerEmail}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  item.available
                    ? styles.availableBadge
                    : styles.unavailableBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    item.available
                      ? styles.availableDot
                      : styles.unavailableDot,
                  ]}
                />

                <Text
                  style={[
                    styles.statusText,
                    item.available
                      ? styles.availableText
                      : styles.unavailableText,
                  ]}
                >
                  {item.available ? "Available" : "Currently Rented"}
                </Text>
              </View>
            </View>
          ))}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
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

  equipmentCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  mainInfo: {
    flex: 1,
    marginLeft: 12,
  },

  equipmentName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  category: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  details: {
    marginTop: 15,
    gap: 8,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailText: {
    flex: 1,
    fontSize: 12,
    color: colors.secondaryText,
    marginLeft: 8,
  },

  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 13,
  },

  availableBadge: {
    backgroundColor: colors.primaryLight,
  },

  unavailableBadge: {
    backgroundColor: "#F3F3F3",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  availableDot: {
    backgroundColor: colors.primary,
  },

  unavailableDot: {
    backgroundColor: colors.secondaryText,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },

  availableText: {
    color: colors.primary,
  },

  unavailableText: {
    color: colors.secondaryText,
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
