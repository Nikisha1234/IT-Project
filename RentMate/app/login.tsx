import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Button from "../components/Button";
import Input from "../components/Input";
import { colors } from "../constants/colors";
import { loginUser } from "../services/api";
import {
  setCurrentUserEmail,
  setCurrentUserName,
  setCurrentUserRole,
} from "../services/authStorage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setEmailError("");
    setPasswordError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Please enter your email.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }

    try {
      const user = await loginUser(trimmedEmail, password);

      await setCurrentUserEmail(user.email);
      await setCurrentUserName(user.name);
      await setCurrentUserRole(user.role);

      if (user.role === "ADMIN") {
        router.replace("../admin/dashboard");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error) {
      setEmailError(
        error instanceof Error ? error.message : "Invalid email or password.",
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="log-in-outline" size={32} color={colors.primary} />
      </View>

      <Text style={styles.title}>Welcome Back</Text>

      <Text style={styles.subtitle}>Login to your account</Text>

      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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

      <Button title="Login" onPress={handleLogin} />

      <Pressable onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>Don't have an account? Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: "center",
    backgroundColor: colors.background,
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
    marginBottom: 30,
    color: colors.secondaryText,
  },

  errorText: {
    color: "#D32F2F",
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },

  registerText: {
    textAlign: "center",
    marginTop: 18,
    color: colors.primary,
    fontWeight: "600",
  },
});
