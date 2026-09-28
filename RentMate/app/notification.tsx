import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
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
  getUserNotifications,
  markNotificationAsRead,
  Notification,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);

      const email = await getCurrentUserEmail();

      if (!email) {
        setNotifications([]);
        return;
      }

      const data = await getUserNotifications(email);

      setNotifications(data);
    } catch (error) {
      console.error("Notification loading error:", error);

      Alert.alert(
        "Unable to load notifications",
        "Could not load your notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications]),
  );

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((currentNotifications) =>
          currentNotifications.map((item) =>
            item.id === notification.id ? { ...item, read: true } : item,
          ),
        );
      }

      const title = notification.title.toLowerCase();

      console.log("Notification pressed:", notification);
      console.log("Notification title:", notification.title);
      console.log("Rental ID:", notification.rentalId);

      if (
        title.includes("rental request accepted") ||
        title.includes("rental accepted")
      ) {
        if (notification.rentalId) {
          router.push({
            pathname: "/payment",
            params: {
              rentalId: notification.rentalId.toString(),
            },
          });
        } else {
          Alert.alert(
            "Payment Unavailable",
            "The rental information could not be found.",
          );
        }

        return;
      }

      if (
        title.includes("payment received") ||
        title.includes("payment completed")
      ) {
        if (notification.rentalId) {
          router.push({
            pathname: "/rental-request",
            params: {
              id: notification.rentalId.toString(),
            },
          });
        } else {
          Alert.alert(
            "Rental Unavailable",
            "The rental information could not be found.",
          );
        }

        return;
      }

      if (
        title.includes("rental request rejected") ||
        title.includes("rental rejected") ||
        title.includes("rental request cancelled") ||
        title.includes("rental cancelled") ||
        title.includes("cash payment confirmed") ||
        title.includes("rental completed")
      ) {
        router.push("/(tabs)/rentals");
        return;
      }

      if (
        title.includes("rental request") ||
        title.includes("return request") ||
        title.includes("cash payment pending")
      ) {
        if (notification.rentalId) {
          router.push({
            pathname: "/rental-request",
            params: {
              id: notification.rentalId.toString(),
            },
          });
        } else {
          router.push("/rental-request");
        }

        return;
      }

      if (notification.rentalId) {
        router.push("/(tabs)/rentals");
        return;
      }

      Alert.alert(
        "Notification",
        "There is no page linked to this notification.",
      );
    } catch (error) {
      console.error("Notification press error:", error);

      Alert.alert("Error", "Unable to open this notification.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Notifications</Text>

        <View style={styles.headerSpace} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="notifications-outline"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.emptyTitle}>No notifications yet</Text>

          <Text style={styles.emptyText}>
            You will see rental updates and other important notifications here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {notifications.map((notification) => (
            <Pressable
              key={notification.id}
              style={({ pressed }) => [
                styles.notificationCard,
                !notification.read && styles.unreadNotification,
                pressed && styles.pressedNotification,
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View style={styles.notificationContent}>
                <View style={styles.notificationTitleRow}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.read && styles.unreadTitle,
                    ]}
                  >
                    {notification.title}
                  </Text>

                  {!notification.read && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>

                <Text style={styles.dateText}>
                  {formatDate(notification.createdAt)}
                </Text>
              </View>
            </Pressable>
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

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },

  headerSpace: {
    width: 40,
  },

  list: {
    padding: 16,
    paddingBottom: 30,
  },

  notificationCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  pressedNotification: {
    opacity: 0.7,
  },

  unreadNotification: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLight,
  },

  notificationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  notificationContent: {
    flex: 1,
  },

  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  notificationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },

  unreadTitle: {
    fontWeight: "bold",
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
  },

  notificationMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.secondaryText,
    marginTop: 5,
  },

  dateText: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 8,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  loadingText: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 10,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 15,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.secondaryText,
    textAlign: "center",
    marginTop: 7,
  },
});
