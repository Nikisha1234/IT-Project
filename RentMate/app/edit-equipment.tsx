import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import Button from "../components/Button";
import Input from "../components/Input";
import { colors } from "../constants/colors";

import {
  getEquipmentById,
  getImageUrl,
  updateEquipment,
  uploadEquipmentImage,
} from "../services/api";

const categories = ["Camera", "Camping", "Music", "Electronics", "Projector"];

export default function EditEquipment() {
  const { id } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [available, setAvailable] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadEquipment = async () => {
      try {
        const data = await getEquipmentById(Number(id));

        setName(data.name);
        setCategory(data.category);
        setPrice(String(data.price));
        setLocation(data.location);
        setDescription(data.description || "");
        setAvailable(data.available);
        setImageUrl(data.imageUrl);
      } catch (error) {
        console.error("Error loading equipment:", error);
        Alert.alert("Error", "Unable to load equipment.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEquipment();
    }
  }, [id]);

  const chooseImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo access to select an equipment image.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        setNewImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Unable to select image.");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !category || !price || !location.trim()) {
      Alert.alert(
        "Missing information",
        "Please fill in name, category, price, and location.",
      );
      return;
    }

    const priceNumber = Number(price);

    if (isNaN(priceNumber) || priceNumber <= 0) {
      Alert.alert("Invalid price", "Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);

      let finalImageUrl = imageUrl;

      if (newImageUri) {
        finalImageUrl = await uploadEquipmentImage(newImageUri);
      }

      await updateEquipment(Number(id), {
        name: name.trim(),
        category,
        price: priceNumber,
        location: location.trim(),
        description: description.trim(),
        available,
        imageUrl: finalImageUrl,
      });

      Alert.alert("Success", "Equipment updated successfully.");

      router.back();
    } catch (error) {
      console.error("UPDATE ERROR:", error);

      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unable to update equipment.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />

        <Text style={styles.loadingText}>Loading equipment...</Text>
      </View>
    );
  }

  const displayImage = newImageUri || getImageUrl(imageUrl);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Edit Equipment</Text>
      </View>

      <Pressable style={styles.imagePicker} onPress={chooseImage}>
        {displayImage ? (
          <Image source={{ uri: displayImage }} style={styles.selectedImage} />
        ) : (
          <>
            <Ionicons name="camera-outline" size={38} color={colors.primary} />

            <Text style={styles.imagePickerTitle}>Add Equipment Photo</Text>

            <Text style={styles.imagePickerSubtitle}>
              Tap to choose a photo
            </Text>
          </>
        )}

        <View style={styles.changeImageButton}>
          <Ionicons name="camera-outline" size={17} color={colors.white} />

          <Text style={styles.changeImageText}>
            {displayImage ? "Change Photo" : "Add Photo"}
          </Text>
        </View>
      </Pressable>

      <Input
        placeholder="Equipment Name"
        value={name}
        onChangeText={setName}
        icon="cube-outline"
      />

      <Input
        placeholder="Price per day (Rs.)"
        value={price}
        onChangeText={setPrice}
        icon="cash-outline"
        keyboardType="numeric"
      />

      <Input
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        icon="location-outline"
      />

      <Input
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        icon="document-text-outline"
        multiline
      />

      <Text style={styles.label}>Category</Text>

      <View style={styles.categoryGrid}>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[
              styles.categoryChip,
              category === cat && styles.categoryChipActive,
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                category === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.availabilityBox}>
        <View style={styles.availabilityTextContainer}>
          <Text style={styles.availabilityTitle}>
            {available ? "Available for rent" : "Currently unavailable"}
          </Text>

          <Text style={styles.availabilitySubtitle}>
            {available
              ? "People can rent this equipment."
              : "This equipment cannot currently be rented."}
          </Text>
        </View>

        <Switch value={available} onValueChange={setAvailable} />
      </View>

      <Button
        title={saving ? "Updating..." : "Update Equipment"}
        onPress={handleUpdate}
        loading={saving}
      />
    </ScrollView>
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

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    color: colors.secondaryText,
    fontSize: 16,
    marginTop: 10,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
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

  subtitle: {
    marginLeft: 54,
    marginTop: 0,
    marginBottom: 25,
    color: colors.secondaryText,
  },

  imagePicker: {
    height: 210,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },

  selectedImage: {
    width: "100%",
    height: "100%",
  },

  imagePickerTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  imagePickerSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: colors.secondaryText,
  },

  changeImageButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },

  changeImageText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 10,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },

  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },

  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryChipText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  categoryChipTextActive: {
    color: colors.white,
  },

  availabilityBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 25,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
  },

  availabilityTextContainer: {
    flex: 1,
    marginRight: 10,
  },

  availabilityTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },

  availabilitySubtitle: {
    fontSize: 12,
    color: colors.secondaryText,
  },
});
