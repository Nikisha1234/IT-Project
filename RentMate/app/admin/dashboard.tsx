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
import {
  getAllAdminEquipment,
  getAllAdminRentals,
  getAllAdminUsers,
} from "../../services/api";
import {
  clearCurrentUserEmail,
  clearCurrentUserRole,
} from "../../services/authStorage";

export default function AdminDashboard() {
  const [userCount, setUserCount] = useState(0);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [rentalCount, setRentalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [users, equipment, rentals] = await Promise.all([
        getAllAdminUsers(),
        getAllAdminEquipment(),
        getAllAdminRentals(),
      ]);

      setUserCount(users.length);
      setEquipmentCount(equipment.length);
      setRentalCount(rentals.length);
    } catch (error) {
      console.error("Dashboard loading error:", error);

      Alert.alert(
        "Unable to load dashboard",
        "Could not load the latest dashboard information.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = async () => {
    await clearCurrentUserEmail();
    await clearCurrentUserRole();

    router.replace("/welcome");
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>RentMate</Text>
          <Text style={styles.title}>Admin Dashboard</Text>
        </View>

        <View style={styles.adminIcon}>
          <Ionicons
            name="shield-checkmark-outline"
            size={26}
            color={colors.primary}
          />
        </View>
      </View>

      <Text style={styles.welcome}>Welcome, Admin 👋</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons
                name="people-outline"
                size={26}
                color={colors.primary}
              />

              <Text style={styles.statNumber}>{userCount}</Text>
              <Text style={styles.statLabel}>Registered users</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="cube-outline" size={26} color={colors.primary} />

              <Text style={styles.statNumber}>{equipmentCount}</Text>
              <Text style={styles.statLabel}>Total equipment</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons
                name="receipt-outline"
                size={26}
                color={colors.primary}
              />

              <Text style={styles.statNumber}>{rentalCount}</Text>
              <Text style={styles.statLabel}>Total rentals</Text>
            </View>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Management</Text>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/users")}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="people-outline" size={23} color={colors.primary} />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Manage Users</Text>
          <Text style={styles.menuDescription}>
            View and manage registered users
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.secondaryText}
        />
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/equipment")}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="cube-outline" size={23} color={colors.primary} />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Manage Equipment</Text>
          <Text style={styles.menuDescription}>
            View and manage all equipment
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.secondaryText}
        />
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/rentals")}
      >
        <View style={styles.menuIcon}>
          <Ionicons name="receipt-outline" size={23} color={colors.primary} />
        </View>

        <View style={styles.menuText}>
          <Text style={styles.menuTitle}>Manage Rentals</Text>
          <Text style={styles.menuDescription}>
            Monitor all rental transactions
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={21}
          color={colors.secondaryText}
        />
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
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

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 3,
  },

  adminIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  welcome: {
    fontSize: 16,
    color: colors.secondaryText,
    marginTop: 18,
    marginBottom: 18,
  },

  loadingContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  loadingText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 8,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 10,
  },

  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 14,
    marginBottom: 12,
  },

  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  menuText: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  menuDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  logoutButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: colors.danger,
    fontWeight: "bold",
  },
});
