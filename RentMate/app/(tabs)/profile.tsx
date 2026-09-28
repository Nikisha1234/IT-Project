import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import {
  clearCurrentUserEmail,
  clearCurrentUserName,
  clearCurrentUserRole,
  getCurrentUserEmail,
  getCurrentUserName,
} from "../../services/authStorage";

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  route?: string;
};

const menuItems: MenuItem[] = [
  {
    label: "Add Equipment",
    icon: "add-circle-outline",
    route: "/add-equipment",
  },
  {
    label: "My Listings",
    icon: "list-outline",
    route: "/my-listings",
  },
  {
    label: "Rental Requests",
    icon: "notifications-outline",
    route: "/rental-request",
  },
  {
    label: "My Rentals",
    icon: "calendar-outline",
    route: "/(tabs)/rentals",
  },
  {
    label: "Identity Verification",
    icon: "shield-checkmark-outline",
    route: "/citizenship",
  },
];

export default function Profile() {
  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const name = await getCurrentUserName();
      const email = await getCurrentUserEmail();

      if (name) {
        setUserName(name);
      }

      if (email) {
        setUserEmail(email);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await clearCurrentUserEmail();
            await clearCurrentUserName();
            await clearCurrentUserRole();

            router.replace("/login");
          } catch (error) {
            console.error("Logout error:", error);

            Alert.alert("Logout Error", "Unable to logout. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={32} color={colors.white} />
        </View>

        <Text style={styles.name}>{userName}</Text>

        <Text style={styles.email}>{userEmail}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account & Activity</Text>

        <View style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>

                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.secondaryText}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <Pressable style={styles.logoutItem} onPress={handleLogout}>
          <View style={styles.menuLeft}>
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={colors.danger}
              />
            </View>

            <Text style={styles.logoutLabel}>Logout</Text>
          </View>
        </Pressable>
      </View>

      <Text style={styles.version}>RentEquip • Equipment Rental Platform</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingBottom: 35,
  },

  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  name: {
    fontSize: 19,
    fontWeight: "700",
    color: colors.text,
  },

  email: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 3,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 22,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondaryText,
    marginBottom: 10,
  },

  menu: {
    gap: 9,
  },

  menuItem: {
    minHeight: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 13,
    paddingHorizontal: 13,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  menuLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },

  logoutItem: {
    minHeight: 60,
    backgroundColor: colors.surface,
    borderRadius: 13,
    paddingHorizontal: 13,
    justifyContent: "center",
  },

  logoutIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FDECEC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  logoutLabel: {
    fontSize: 15,
    color: colors.danger,
    fontWeight: "600",
  },

  version: {
    textAlign: "center",
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 25,
  },
});
