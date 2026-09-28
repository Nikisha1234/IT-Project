import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "../constants/colors";

export default function PhotoEditor() {
  const params = useLocalSearchParams<{
    uri: string;
    index: string;
  }>();

  const [imageUri, setImageUri] = useState(params.uri);
  const [loading, setLoading] = useState(false);

  const rotatePhoto = async () => {
    try {
      setLoading(true);

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ rotate: 90 }],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      setImageUri(result.uri);
    } catch (error) {
      console.error("Rotate error:", error);
    } finally {
      setLoading(false);
    }
  };

  const cropPhoto = async () => {
    try {
      setLoading(true);

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            crop: {
              originX: 0,
              originY: 0,
              width: 1000,
              height: 1000,
            },
          },
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      setImageUri(result.uri);
    } catch (error) {
      console.error("Crop error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>

        <Text style={styles.headerTitle}>Edit Photo</Text>

        <Pressable onPress={() => router.back()} style={styles.doneButton}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>

      <View style={styles.imageArea}>
        <Image source={{ uri: imageUri }} style={styles.image} />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
          </View>
        )}
      </View>

      <View style={styles.tools}>
        <Pressable style={styles.tool} onPress={cropPhoto}>
          <View style={styles.toolIcon}>
            <Ionicons name="crop-outline" size={25} color={colors.white} />
          </View>

          <Text style={styles.toolText}>Crop</Text>
        </Pressable>

        <Pressable style={styles.tool} onPress={rotatePhoto}>
          <View style={styles.toolIcon}>
            <Ionicons name="refresh-outline" size={25} color={colors.white} />
          </View>

          <Text style={styles.toolText}>Rotate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },

  header: {
    height: 90,
    paddingTop: 35,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },

  doneButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  doneText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  imageArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },

  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  tools: {
    height: 125,
    borderTopWidth: 1,
    borderTopColor: "#333333",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 45,
  },

  tool: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },

  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#292929",
  },

  toolText: {
    color: colors.white,
    fontSize: 12,
    marginTop: 7,
  },
});
