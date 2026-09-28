import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import EquipmentCard from "../../components/EquipmentCard";
import SearchBar from "../../components/SearchBar";
import { colors } from "../../constants/colors";
import { getEquipment } from "../../services/api";

const categories = [
  "All",
  "Camera",
  "Projector",
  "Camping",
  "Music",
  "Electronics",
];

export default function Explore() {
  const params = useLocalSearchParams<{ category?: string }>();

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const category = Array.isArray(params.category)
      ? params.category[0]
      : params.category;

    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory("All");
    }
  }, [params.category]);

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
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Explore Equipment</Text>
        </View>
      </View>

      <SearchBar value={searchText} onChangeText={setSearchText} />

      {searchText.trim() === "" && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.activeCategory,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.activeCategoryText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {loading && <Text style={styles.message}>Loading equipment...</Text>}

      {!loading && error !== "" && <Text style={styles.message}>{error}</Text>}

      {!loading && error === "" && (
        <Text style={styles.resultCount}>
          {filteredEquipment.length}{" "}
          {filteredEquipment.length === 1 ? "item" : "items"} found
        </Text>
      )}

      {!loading && error === "" && (
        <FlatList
          style={styles.equipmentList}
          data={filteredEquipment}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
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
                    id: item.id,
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <Text style={styles.noResults}>No equipment found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 55,
    backgroundColor: colors.background,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
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

  categoryList: {
    marginTop: 6,
    marginBottom: 6,
    flexGrow: 0,
  },

  categoryContent: {
    alignItems: "center",
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 10,
  },

  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },

  activeCategory: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  activeCategoryText: {
    color: colors.white,
  },

  resultCount: {
    color: colors.secondaryText,
    marginBottom: 10,
    fontSize: 13,
  },

  equipmentList: {
    flex: 1,
  },

  message: {
    textAlign: "center",
    marginTop: 30,
    color: colors.secondaryText,
    fontSize: 16,
  },

  noResults: {
    textAlign: "center",
    marginTop: 40,
    color: colors.secondaryText,
    fontSize: 16,
  },
});
