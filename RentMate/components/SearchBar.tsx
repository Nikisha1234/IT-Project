import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.secondaryText}
        style={styles.icon}
      />
      <TextInput
        style={styles.search}
        placeholder="Search equipment..."
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    marginBottom: 15,
  },
  icon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    paddingLeft: 40,
    fontSize: 15,
    color: colors.text,
  },
});
