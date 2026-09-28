import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import {
  addEquipment,
  getCitizenshipStatus,
  uploadEquipmentImage,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

const categories = ["Camera", "Camping", "Music", "Electronics", "Projector"];

export default function AddEquipment() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionHeight, setDescriptionHeight] = useState(50);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow photo access to select equipment images.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 3,
    });

    if (!result.canceled && result.assets.length > 0) {
      const imageUris = result.assets.slice(0, 3).map((asset) => asset.uri);

      setSelectedImages(imageUris);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index),
    );
  };

  const showCitizenshipRequired = () => {
    Alert.alert(
      "Citizenship Required",
      "Please provide your citizenship before listing equipment.",
      [
        {
          text: "Continue",
          onPress: () => router.push("/citizenship"),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter equipment name.");
      return;
    }

    if (!category) {
      Alert.alert("Required", "Please select a category.");
      return;
    }

    if (!price.trim()) {
      Alert.alert("Required", "Please enter rental price.");
      return;
    }

    if (!securityDeposit.trim()) {
      Alert.alert("Required", "Please enter security deposit.");
      return;
    }

    if (!location.trim()) {
      Alert.alert("Required", "Please enter location.");
      return;
    }

    try {
      setLoading(true);

      const ownerEmail = await getCurrentUserEmail();

      if (!ownerEmail) {
        Alert.alert("Login Required", "Please log in before adding equipment.");
        return;
      }

      const citizenshipProvided = await getCitizenshipStatus(ownerEmail);

      if (!citizenshipProvided) {
        showCitizenshipRequired();
        return;
      }

      let uploadedImageUrl = "";

      if (selectedImages.length > 0) {
        const firstImage = selectedImages[0];

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          firstImage,
          [{ resize: { width: 1200 } }],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        );

        uploadedImageUrl = await uploadEquipmentImage(manipulatedImage.uri);

        console.log("Image upload response:", uploadedImageUrl);
      }

      const priceNumber = Number(price);
      const depositNumber = Number(securityDeposit);

      await addEquipment({
        name: name.trim(),
        category,
        price: priceNumber,
        location: location.trim(),
        description: description.trim(),
        available: true,
        ownerEmail,
        imageUrl: uploadedImageUrl,
        securityDeposit: depositNumber,
      });

      Alert.alert("Success", "Equipment added successfully.", [
        {
          text: "Continue",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Error adding equipment:", error);

      const message =
        error instanceof Error ? error.message : "Failed to add equipment.";

      if (message.toLowerCase().includes("citizenship")) {
        showCitizenshipRequired();
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Add Equipment</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.sectionTitle}>Equipment Images</Text>

          <Pressable style={styles.uploadBox} onPress={pickImages}>
            {selectedImages.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                style={styles.mainImageScroll}
              >
                {selectedImages.map((uri, index) => (
                  <View
                    key={`${uri}-${index}`}
                    style={styles.mainImageContainer}
                  >
                    <Image source={{ uri }} style={styles.mainPreviewImage} />

                    <View style={styles.imageSwipeTextContainer}>
                      <Text style={styles.imageSwipeText}>
                        {index + 1} / {selectedImages.length}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={42}
                  color={colors.primary}
                />

                <Text style={styles.uploadTitle}>Add Equipment Images</Text>

                <Text style={styles.uploadSubtitle}>Select up to 3 images</Text>
              </>
            )}
          </Pressable>

          {selectedImages.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
              contentContainerStyle={styles.imagePreviewContainer}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {selectedImages.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.previewImage} />

                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={18} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>Equipment Name</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter equipment name"
            placeholderTextColor={colors.secondaryText}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((item) => (
              <Pressable
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.categoryButtonSelected,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.categoryTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.label}>Rental Price Per Day</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor={colors.secondaryText}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Security Deposit</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter security deposit"
            placeholderTextColor={colors.secondaryText}
            value={securityDeposit}
            onChangeText={setSecurityDeposit}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Location</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter equipment location"
            placeholderTextColor={colors.secondaryText}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>Description</Text>

          <TextInput
            style={[
              styles.input,
              styles.descriptionInput,
              { height: descriptionHeight },
            ]}
            placeholder="Describe your equipment"
            placeholderTextColor={colors.secondaryText}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            onContentSizeChange={(event) => {
              const height = event.nativeEvent.contentSize.height;
              setDescriptionHeight(Math.max(50, height + 20));
            }}
          />

          <Pressable
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Add Equipment</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  keyboardContainer: {
    flex: 1,
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

  headerTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 10,
    marginBottom: 14,
  },

  uploadBox: {
    height: 150,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  uploadTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },

  uploadSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.secondaryText,
  },

  mainImageScroll: {
    width: "100%",
    height: "100%",
  },

  mainImageContainer: {
    width: 350,
    height: 150,
    position: "relative",
  },

  mainPreviewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  imageSwipeTextContainer: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  imageSwipeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  imageScroll: {
    marginTop: 14,
    marginBottom: 6,
  },

  imagePreviewContainer: {
    paddingRight: 10,
  },

  imageWrapper: {
    marginRight: 10,
    position: "relative",
  },

  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },

  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    height: 50,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
  },

  descriptionInput: {
    paddingTop: 14,
    paddingBottom: 14,
  },

  categoryScroll: {
    marginBottom: 2,
  },

  categoryContainer: {
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

  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },

  categoryTextSelected: {
    color: "#FFFFFF",
  },

  submitButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
