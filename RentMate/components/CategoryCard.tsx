import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/colors";

type CategoryCardProps = {
  name: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function CategoryCard({
  name,
  icon,
  onPress,
}: CategoryCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {icon && <Ionicons name={icon} size={20} color={colors.primary} />}
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginRight: 10,
    marginBottom: 10,
  },
  name: {
    fontWeight: "600",
    color: colors.text,
  },
});
