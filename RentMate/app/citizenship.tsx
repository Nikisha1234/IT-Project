import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import { submitCitizenship } from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

export default function CitizenshipScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const chooseCitizenship = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow photo access to select your citizenship image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert(
        "Citizenship Required",
        "Please select your citizenship image first.",
      );
      return;
    }

    try {
      setLoading(true);

      const email = await getCurrentUserEmail();

      if (!email) {
        Alert.alert(
          "Login Required",
          "Please log in before submitting your citizenship.",
        );
        return;
      }

      await submitCitizenship(email, imageUri);

      Alert.alert("Success", "Citizenship submitted successfully.", [
        {
          text: "Continue",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.log("Citizenship submission error:", error);

      Alert.alert(
        "Submission Failed",
        error?.message || "Unable to submit citizenship.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Citizenship</Text>

        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={42}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>Provide Your Citizenship</Text>

        <Text style={styles.subtitle}>
          Citizenship information is required before you can rent or list
          equipment on RentEquip.
        </Text>

        <View style={styles.infoBox}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={colors.primary}
          />

          <Text style={styles.infoText}>
            Upload one clear image of your citizenship photocopy. Your document
            is stored securely and is not shown publicly to other users.
          </Text>
        </View>

        <Text style={styles.label}>Citizenship Image</Text>

        <Pressable style={styles.uploadBox} onPress={chooseCitizenship}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="contain"
            />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={48}
                color={colors.primary}
              />

              <Text style={styles.uploadTitle}>Select Citizenship Image</Text>

              <Text style={styles.uploadSubtitle}>Tap to choose an image</Text>
            </>
          )}
        </Pressable>

        {imageUri && (
          <Pressable style={styles.changeButton} onPress={chooseCitizenship}>
            <Ionicons name="image-outline" size={18} color={colors.primary} />

            <Text style={styles.changeText}>Change Image</Text>
          </Pressable>
        )}

        <Pressable
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitText}>Submit Citizenship</Text>
          )}
        </Pressable>
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
    height: 100,
    paddingTop: 38,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "700",
    color: colors.text,
  },

  headerSpace: {
    width: 42,
  },

  content: {
    padding: 22,
    paddingBottom: 40,
  },

  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 18,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.secondaryText,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 22,
  },

  infoBox: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: colors.secondaryText,
    marginLeft: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 10,
  },

  uploadBox: {
    height: 230,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    overflow: "hidden",
  },

  preview: {
    width: "100%",
    height: "100%",
  },

  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 12,
  },

  uploadSubtitle: {
    fontSize: 13,
    color: colors.secondaryText,
    marginTop: 5,
  },

  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
  },

  changeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  submitButton: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
