import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "../components/Button";
import Input from "../components/Input";
import { colors } from "../constants/colors";
import { registerUser } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async () => {
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");
    setSuccessMessage("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    let hasError = false;

    if (!trimmedName) {
      setNameError("Please enter your full name.");
      hasError = true;
    }

    if (!trimmedEmail) {
      setEmailError("Please enter your email.");
      hasError = true;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(trimmedEmail)) {
        setEmailError("Please enter a valid email address.");
        hasError = true;
      }
    }

    if (!trimmedPhone) {
      setPhoneError("Please enter your phone number.");
      hasError = true;
    }

    if (!password) {
      setPasswordError("Please enter a password.");
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        password,
      });

      setSuccessMessage("Account created successfully.");

      setTimeout(() => {
        router.replace("/login");
      }, 800);
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create your account.";

      if (message.toLowerCase().includes("email")) {
        setEmailError(message);
      } else {
        setPasswordError(message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="person-add-outline"
              size={32}
              color={colors.primary}
            />
          </View>

          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.subtitle}>
            Join the community and start renting
          </Text>

          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

          <Input
            placeholder="Full Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError("");
            }}
            icon="person-outline"
          />

          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

          <Input
            placeholder="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            icon="mail-outline"
            keyboardType="email-address"
          />

          {phoneError ? (
            <Text style={styles.errorText}>{phoneError}</Text>
          ) : null}

          <Input
            placeholder="Phone Number"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneError("");
            }}
            icon="call-outline"
            keyboardType="phone-pad"
          />

          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <Input
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError("");
            }}
            secureTextEntry={!showPassword}
            icon="lock-closed-outline"
            showPasswordToggle
            onTogglePassword={() => setShowPassword((current) => !current)}
          />

          <Button title="Register" onPress={handleRegister} />

          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}

          <Pressable onPress={() => router.replace("/login")}>
            <Text style={styles.loginText}>Already have an account? Login</Text>
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

  scrollContent: {
    flexGrow: 1,
    padding: 25,
    justifyContent: "center",
    paddingBottom: 40,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text,
  },

  subtitle: {
    textAlign: "center",
    marginTop: 6,
    marginBottom: 25,
    color: colors.secondaryText,
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },

  successText: {
    color: "#2E7D32",
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },

  loginText: {
    textAlign: "center",
    marginTop: 18,
    color: colors.primary,
    fontWeight: "600",
  },
});
