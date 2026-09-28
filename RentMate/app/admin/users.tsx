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
import { deleteAdminUser, getAllAdminUsers } from "../../services/api";

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  citizenshipProvided: boolean;
  citizenshipUrl?: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAllAdminUsers();

      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = (user: AdminUser) => {
    if (user.role === "ADMIN") {
      Alert.alert("Not Allowed", "The admin account cannot be deleted.");
      return;
    }

    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user.name}?`,
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
              await deleteAdminUser(user.id);

              Alert.alert("Success", "User deleted successfully.");

              loadUsers();
            } catch (error) {
              console.error("Error deleting user:", error);

              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Unable to delete user.",
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
          <Text style={styles.title}>Manage Users</Text>
          <Text style={styles.subtitle}>View and manage registered users</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="people-outline"
            size={50}
            color={colors.secondaryText}
          />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptyText}>
            Registered users will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.countCard}>
            <Ionicons name="people-outline" size={25} color={colors.primary} />

            <View>
              <Text style={styles.countNumber}>{users.length}</Text>
              <Text style={styles.countLabel}>Registered Users</Text>
            </View>
          </View>

          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <View style={styles.userIcon}>
                <Ionicons
                  name={
                    user.role === "ADMIN"
                      ? "shield-checkmark-outline"
                      : "person-outline"
                  }
                  size={23}
                  color={colors.primary}
                />
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user.name}</Text>

                  <View
                    style={[
                      styles.roleBadge,
                      user.role === "ADMIN" && styles.adminBadge,
                    ]}
                  >
                    <Text style={styles.roleText}>{user.role}</Text>
                  </View>
                </View>

                <Text style={styles.userEmail}>{user.email}</Text>

                <Text style={styles.userPhone}>
                  {user.phone || "No phone number"}
                </Text>

                <View style={styles.citizenshipRow}>
                  <Ionicons
                    name={
                      user.citizenshipProvided
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={16}
                    color={
                      user.citizenshipProvided
                        ? colors.primary
                        : colors.secondaryText
                    }
                  />

                  <Text
                    style={[
                      styles.citizenshipText,
                      user.citizenshipProvided &&
                        styles.citizenshipProvidedText,
                    ]}
                  >
                    Citizenship:{" "}
                    {user.citizenshipProvided ? "Provided" : "Not Provided"}
                  </Text>
                </View>
              </View>

              {user.role !== "ADMIN" && (
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDelete(user)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={colors.danger}
                  />
                </Pressable>
              )}
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
    marginLeft: 12,
    flex: 1,
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

  userCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  userIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  userInfo: {
    flex: 1,
    marginLeft: 12,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  roleBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  adminBadge: {
    backgroundColor: colors.primaryLight,
  },

  roleText: {
    fontSize: 9,
    fontWeight: "bold",
    color: colors.primary,
  },

  userEmail: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 5,
  },

  userPhone: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  citizenshipRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 5,
  },

  citizenshipText: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: "500",
  },

  citizenshipProvidedText: {
    color: colors.primary,
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FDECEC",
    marginLeft: 8,
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
