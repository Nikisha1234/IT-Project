import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";
import {
  Equipment,
  getEquipment,
  getImageUrl,
  getUserNotifications,
  Notification,
} from "../../services/api";
import { getCurrentUserEmail } from "../../services/authStorage";

const categories = [
  { name: "Camera", icon: "camera-outline" as const },
  { name: "Projector", icon: "videocam-outline" as const },
  { name: "Camping", icon: "bonfire-outline" as const },
  { name: "Music", icon: "musical-notes-outline" as const },
  { name: "Electronics", icon: "hardware-chip-outline" as const },
];

export default function Home() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadEquipment = async () => {
    try {
      setLoading(true);

      const data = await getEquipment();

      const validEquipment = data.filter(
        (item) => item.ownerEmail && item.ownerEmail.trim() !== "",
      );

      const latestEquipment = [...validEquipment]
        .sort((a, b) => b.id - a.id)
        .slice(0, 4);

      setEquipment(latestEquipment);
    } catch (error) {
      console.error("Error loading equipment:", error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadNotifications = async () => {
    try {
      const email = await getCurrentUserEmail();

      if (!email) {
        setUnreadCount(0);
        return;
      }

      const notifications: Notification[] = await getUserNotifications(email);

      const unread = notifications.filter(
        (notification) => !notification.read,
      ).length;

      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notification count:", error);
      setUnreadCount(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadEquipment();
      loadUnreadNotifications();
    }, []),
  );

  const openCategory = (category: string) => {
    router.push({
      pathname: "/explore",
      params: {
        category: category,
      },
    });
  };

  const renderEquipment = ({ item }: { item: Equipment }) => {
    const imageUrl = getImageUrl(item.imageUrl);

    return (
      <Pressable
        style={styles.equipmentCard}
        onPress={() =>
          router.push({
            pathname: "/equipment-details",
            params: {
              id: item.id.toString(),
            },
          })
        }
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.equipmentImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={34}
                color={colors.secondaryText}
              />
            </View>
          )}
        </View>

        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.secondaryText}
            />

            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              Rs. {item.price}
              <Text style={styles.perDay}>/day</Text>
            </Text>

            <View
              style={[
                styles.availabilityBadge,
                item.available
                  ? styles.availableBadge
                  : styles.unavailableBadge,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  item.available
                    ? styles.availableText
                    : styles.unavailableText,
                ]}
              >
                {item.available ? "Available" : "Unavailable"}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>RentMate</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/notification")}
          >
            <Ionicons
              name="notifications-outline"
              size={23}
              color={colors.text}
            />

            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>

          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Ionicons name="person-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingSubtitle}>
            Find the equipment you need
          </Text>
        </View>

        <Pressable
          style={styles.searchBar}
          onPress={() => router.push("/(tabs)/explore")}
        >
          <Ionicons
            name="search-outline"
            size={21}
            color={colors.secondaryText}
          />

          <Text style={styles.searchText}>Search equipment...</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/explore",
                params: { category: "All" },
              })
            }
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category.name}
              style={styles.categoryCard}
              onPress={() => openCategory(category.name)}
            >
              <View style={styles.categoryIcon}>
                <Ionicons
                  name={category.icon}
                  size={24}
                  color={colors.primary}
                />
              </View>

              <Text style={styles.categoryName}>{category.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Equipment</Text>

            <Text style={styles.sectionSubtitle}>
              Recently listed equipment
            </Text>
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/explore",
                params: { category: "All" },
              })
            }
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />

            <Text style={styles.loadingText}>Loading equipment...</Text>
          </View>
        ) : equipment.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cube-outline"
              size={42}
              color={colors.secondaryText}
            />

            <Text style={styles.emptyTitle}>No equipment available</Text>

            <Text style={styles.emptyText}>
              Equipment listed by users will appear here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={equipment}
            renderItem={renderEquipment}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.equipmentGrid}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 5,
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 27,
    fontWeight: "800",
    fontStyle: "italic",
    color: colors.primary,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.secondaryText,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  notificationBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#D93030",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.background,
  },

  notificationBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "bold",
  },

  greetingContainer: {
    marginTop: 1,
  },

  greeting: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },

  greetingSubtitle: {
    marginTop: 5,
    fontSize: 15,
    color: colors.secondaryText,
  },

  searchBar: {
    height: 52,
    marginTop: 22,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  searchText: {
    fontSize: 15,
    color: colors.secondaryText,
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.secondaryText,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },

  categoryContainer: {
    paddingRight: 10,
    gap: 12,
  },

  categoryCard: {
    width: 92,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0EBF8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
  },

  equipmentGrid: {
    paddingBottom: 10,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 14,
  },

  equipmentCard: {
    width: "48%",
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
    elevation: 2,
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  imageContainer: {
    width: "100%",
    height: 135,
    position: "relative",
  },

  equipmentImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    backgroundColor: "#F1EFF5",
    justifyContent: "center",
    alignItems: "center",
  },

  equipmentInfo: {
    padding: 12,
  },

  equipmentName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    color: colors.secondaryText,
  },

  priceRow: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    flexShrink: 1,
  },

  perDay: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.secondaryText,
  },

  availabilityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },

  availableBadge: {
    backgroundColor: "#E7F7ED",
  },

  unavailableBadge: {
    backgroundColor: "#FDECEC",
  },

  availabilityText: {
    fontSize: 10,
    fontWeight: "700",
  },

  availableText: {
    color: "#238B45",
  },

  unavailableText: {
    color: "#C43D3D",
  },

  loadingContainer: {
    paddingVertical: 50,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },

  emptyContainer: {
    paddingVertical: 45,
    paddingHorizontal: 20,
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 13,
    color: colors.secondaryText,
    textAlign: "center",
  },
});
