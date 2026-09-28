import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../constants/colors";

export default function Welcome() {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.iconCircle}>
          <Ionicons name="cube-outline" size={44} color={colors.white} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Rent what you need.</Text>

          <Text style={styles.subtitle}>
            Cameras, tents, instruments and more — shared by people near you.
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Ionicons name="camera-outline" size={22} color={colors.white} />
              <Text style={styles.featureText}>Cameras</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="bonfire-outline" size={22} color={colors.white} />
              <Text style={styles.featureText}>Camping</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="musical-notes-outline"
                size={22}
                color={colors.white}
              />
              <Text style={styles.featureText}>Music</Text>
            </View>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Get Started</Text>

          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safe: {
    flex: 1,
    paddingHorizontal: 25,
    paddingVertical: 40,
    justifyContent: "space-between",
  },

  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: colors.white,
    lineHeight: 40,
  },

  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 14,
    lineHeight: 22,
  },

  featureRow: {
    flexDirection: "row",
    marginTop: 35,
    gap: 24,
  },

  featureItem: {
    alignItems: "center",
    gap: 6,
  },

  featureText: {
    color: colors.white,
    fontSize: 13,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 14,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
