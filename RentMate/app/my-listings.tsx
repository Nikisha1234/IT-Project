import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EquipmentCard from "../components/EquipmentCard";
import { colors } from "../constants/colors";
import { Equipment, getEquipmentByOwnerEmail } from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

export default function MyListings() {
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMyEquipment = async () => {
    try {
      setLoading(true);

      const email = await getCurrentUserEmail();

      if (!email) {
        setMyEquipment([]);
        return;
      }

      const data = await getEquipmentByOwnerEmail(email);

      setMyEquipment(data);
    } catch (error) {
      console.error("Error loading my equipment:", error);
      setMyEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMyEquipment();
    }, []),
  );

  const availableCount = myEquipment.filter((item) => item.available).length;

  const unavailableCount = myEquipment.length - availableCount;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>My Listings</Text>

        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/add-equipment")}
        >
          <Ionicons name="add" size={24} color={colors.white} />
        </Pressable>
      </View>

      {!loading && myEquipment.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="cube-outline" size={20} color={colors.primary} />
            </View>

            <View>
              <Text style={styles.summaryNumber}>{myEquipment.length}</Text>

              <Text style={styles.summaryLabel}>Total Listings</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>

            <View>
              <Text style={styles.summaryNumber}>{availableCount}</Text>

              <Text style={styles.summaryLabel}>Available</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <View style={styles.summaryIcon}>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </View>

            <View>
              <Text style={styles.summaryNumber}>{unavailableCount}</Text>

              <Text style={styles.summaryLabel}>Rented</Text>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={myEquipment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={
            myEquipment.length === 0 ? styles.emptyList : styles.list
          }
          renderItem={({ item }) => (
            <EquipmentCard
              name={item.name}
              price={item.price}
              location={item.location}
              available={item.available}
              imageUrl={item.imageUrl}
              onPress={() =>
                router.push({
                  pathname: "/equipment-details",
                  params: {
                    id: item.id.toString(),
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="cube-outline"
                  size={42}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.emptyTitle}>No Equipment Listed</Text>

              <Text style={styles.emptyText}>
                You haven't listed any equipment yet. Add your first item and
                start renting it out to other users.
              </Text>

              <Pressable
                style={styles.emptyButton}
                onPress={() => router.push("/add-equipment")}
              >
                <Ionicons name="add" size={20} color={colors.white} />

                <Text style={styles.emptyButtonText}>Add Equipment</Text>
              </Pressable>
            </View>
          }
        />
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
    paddingTop: 55,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
  },

  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  summaryNumber: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  summaryLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 1,
  },

  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  list: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
  },

  emptyButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
