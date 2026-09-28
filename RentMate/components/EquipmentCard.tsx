import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { getImageUrl } from "../services/api";

type EquipmentCardProps = {
  name: string;
  price: number;
  location: string;
  available: boolean;
  imageUrl?: string | null;
  onPress: () => void;
};

export default function EquipmentCard({
  name,
  price,
  location,
  available,
  imageUrl,
  onPress,
}: EquipmentCardProps) {
  const image = getImageUrl(imageUrl);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imagePlaceholder}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Ionicons
            name="image-outline"
            size={26}
            color={colors.secondaryText}
          />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        <View style={styles.row}>
          <Ionicons
            name="location-outline"
            size={13}
            color={colors.secondaryText}
          />

          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <Text style={styles.price}>
          Rs. {price}
          <Text style={styles.perDay}>/day</Text>
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          available ? styles.availableBadge : styles.unavailableBadge,
        ]}
      >
        <Text style={available ? styles.availableText : styles.unavailableText}>
          {available ? "Available" : "Unavailable"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 10,
    marginBottom: 14,
    backgroundColor: colors.surface,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  imagePlaceholder: {
    width: 84,
    height: 84,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  info: {
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginBottom: 6,
  },

  location: {
    color: colors.secondaryText,
    fontSize: 12,
    flex: 1,
  },

  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },

  perDay: {
    fontSize: 12,
    fontWeight: "normal",
    color: colors.secondaryText,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },

  availableBadge: {
    backgroundColor: colors.successBg,
  },

  unavailableBadge: {
    backgroundColor: colors.dangerBg,
  },

  availableText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "bold",
  },

  unavailableText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: "bold",
  },
});
