import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { colors } from "../constants/colors";

type InputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
};

export default function Input({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  icon,
  multiline = false,
  keyboardType,
  showPasswordToggle = false,
  onTogglePassword,
}: InputProps) {
  return (
    <View style={styles.wrapper}>
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={colors.secondaryText}
          style={styles.icon}
        />
      )}

      <TextInput
        style={[
          styles.input,
          icon ? styles.inputWithIcon : null,
          showPasswordToggle ? styles.inputWithToggle : null,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
      />

      {showPasswordToggle && value.length > 0 && (
        <Pressable style={styles.eyeButton} onPress={onTogglePassword}>
          <Ionicons
            name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.secondaryText}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    marginBottom: 14,
  },

  icon: {
    position: "absolute",
    left: 14,
    zIndex: 1,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: colors.text,
  },

  inputWithIcon: {
    paddingLeft: 40,
  },

  inputWithToggle: {
    paddingRight: 48,
  },

  eyeButton: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
});
