import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors } from "../constants/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
};

export default function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
}: ButtonProps) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      style={[styles.button, isOutline ? styles.outline : styles.primary]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text style={isOutline ? styles.outlineText : styles.primaryText}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 8,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  outlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
