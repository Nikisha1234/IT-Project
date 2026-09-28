import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { colors } from "../constants/colors";
import { Equipment, getEquipment, getImageUrl } from "../services/api";

const categories = ["All", "Camera", "Camping", "Music", "Electronics"];

export default function Explore() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEquipment();
      setEquipment(data);
    } catch (error) {
      console.error("Error loading equipment:", error);
      setError("Unable to load equipment.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.toLowerCase()) ||
      item.location.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.smallTitle}>RentEquip</Text>
          <Text style={styles.title}>Explore Equipment</Text>
        </View>

        <Pressable style={styles.refreshButton} onPress={loadEquipment}>
          <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.secondaryText}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search equipment..."
            placeholderTextColor={colors.secondaryText}
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.secondaryText}
              />
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>Categories</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.equipmentHeader}>
          <Text style={styles.sectionTitle}>Available Equipment</Text>

          <Text style={styles.resultCount}>
            {filteredEquipment.length} items
          </Text>
        </View>

        {loading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />

            <Text style={styles.loadingText}>Loading equipment...</Text>
          </View>
        )}

        {!loading && error !== "" && (
          <View style={styles.centered}>
            <Ionicons
              name="cloud-offline-outline"
              size={42}
              color={colors.secondaryText}
            />

            <Text style={styles.errorText}>{error}</Text>

            <Pressable style={styles.retryButton} onPress={loadEquipment}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        )}

        {!loading && error === "" && filteredEquipment.length === 0 && (
          <View style={styles.centered}>
            <Ionicons
              name="search-outline"
              size={42}
              color={colors.secondaryText}
            />

            <Text style={styles.emptyTitle}>No equipment found</Text>

            <Text style={styles.emptyText}>
              Try another search or category.
            </Text>
          </View>
        )}

        {!loading && error === "" && filteredEquipment.length > 0 && (
          <View style={styles.equipmentList}>
            {filteredEquipment.map((item) => {
              const imageUrl = getImageUrl(item.imageUrl);

              return (
                <Pressable
                  key={item.id}
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
                      />
                    ) : (
                      <Ionicons
                        name="image-outline"
                        size={38}
                        color={colors.secondaryText}
                      />
                    )}

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

                  <View style={styles.equipmentInfo}>
                    <Text style={styles.equipmentName} numberOfLines={1}>
                      {item.name}
                    </Text>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="pricetag-outline"
                        size={14}
                        color={colors.secondaryText}
                      />

                      <Text style={styles.infoText}>{item.category}</Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Ionicons
                        name="location-outline"
                        size={14}
                        color={colors.secondaryText}
                      />

                      <Text style={styles.infoText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <Text style={styles.price}>
                        Rs. {item.price}
                        <Text style={styles.perDay}> /day</Text>
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
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

  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  smallTitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 3,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  searchContainer: {
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 24,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },

  categoryContainer: {
    paddingBottom: 24,
    gap: 10,
  },

  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  selectedCategoryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  selectedCategoryText: {
    color: "#FFFFFF",
  },

  equipmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  resultCount: {
    fontSize: 13,
    color: colors.secondaryText,
    marginBottom: 12,
  },

  equipmentList: {
    gap: 14,
  },

  equipmentCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
  },

  imageContainer: {
    width: 110,
    height: 120,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  equipmentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  availabilityBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
  },

  availableBadge: {
    backgroundColor: "#E8F7EE",
  },

  unavailableBadge: {
    backgroundColor: "#FDECEC",
  },

  availabilityText: {
    fontSize: 9,
    fontWeight: "700",
  },

  availableText: {
    color: "#228B50",
  },

  unavailableText: {
    color: colors.danger,
  },

  equipmentInfo: {
    flex: 1,
    marginLeft: 14,
    paddingVertical: 3,
  },

  equipmentName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  infoText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginLeft: 5,
    flex: 1,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },

  perDay: {
    fontSize: 11,
    fontWeight: "400",
    color: colors.secondaryText,
  },

  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.secondaryText,
  },

  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.text,
  },

  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 14,
    color: colors.secondaryText,
  },
});
