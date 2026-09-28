import { Redirect, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { colors } from "../../constants/colors";
import { getCurrentUserRole } from "../../services/authStorage";

export default function AdminLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      const currentRole = await getCurrentUserRole();

      setRole(currentRole);
      setChecking(false);
    };

    checkAdminRole();
  }, []);

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (role !== "ADMIN") {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
};
