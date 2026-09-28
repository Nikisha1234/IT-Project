import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../constants/colors";
import { useMode } from "../context/ModeContext";

export default function ModeSelection() {
  const { setMode } = useMode();

  const selectMode = async (mode: "customer" | "renter") => {
    await setMode(mode);
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons
          name="swap-horizontal-outline"
          size={34}
          color={colors.primary}
        />
      </View>

      <Text style={styles.title}>How would you like to use RentEquip?</Text>

      <Text style={styles.subtitle}>
        Choose your current mode. You can switch between them anytime.
      </Text>

      {/* CUSTOMER */}
      <Pressable style={styles.modeCard} onPress={() => selectMode("customer")}>
        <View style={styles.modeIcon}>
          <Ionicons name="search-outline" size={28} color={colors.primary} />
        </View>

        <View style={styles.modeContent}>
          <Text style={styles.modeTitle}>Customer</Text>

          <Text style={styles.modeDescription}>
            Find and rent equipment from other people.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.secondaryText}
        />
      </Pressable>

      {/* RENTER */}
      <Pressable style={styles.modeCard} onPress={() => selectMode("renter")}>
        <View style={styles.modeIcon}>
          <Ionicons name="cube-outline" size={28} color={colors.primary} />
        </View>

        <View style={styles.modeContent}>
          <Text style={styles.modeTitle}>Renter</Text>

          <Text style={styles.modeDescription}>
            List your equipment and manage your rentals.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.secondaryText}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 25,
    justifyContent: "center",
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },

  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 30,
  },

  modeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  modeIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  modeContent: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },

  modeDescription: {
    fontSize: 13,
    color: colors.secondaryText,
    lineHeight: 18,
  },
});
