import { UserProvider } from "@/context/UserContext";
import { Stack } from "expo-router";
import { ModeProvider } from "../context/ModeContext";

export default function RootLayout() {
  return (
    <ModeProvider>
      <UserProvider>
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />

          <Stack.Screen name="index" options={{ headerShown: false }} />

          <Stack.Screen name="login" options={{ headerShown: false }} />

          <Stack.Screen name="register" options={{ headerShown: false }} />

          <Stack.Screen
            name="mode-selection"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          <Stack.Screen name="admin" options={{ headerShown: false }} />

          <Stack.Screen
            name="equipment-details"
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="rental-details"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="add-equipment" options={{ headerShown: false }} />

          <Stack.Screen name="my-listings" options={{ headerShown: false }} />

          <Stack.Screen
            name="rental-request"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="notification" options={{ headerShown: false }} />

          <Stack.Screen
            name="edit-equipment"
            options={{ headerShown: false }}
          />

          <Stack.Screen name="payment" options={{ headerShown: false }} />

          <Stack.Screen name="citizenship" options={{ headerShown: false }} />

          <Stack.Screen name="chat" options={{ headerShown: false }} />
        </Stack>
      </UserProvider>
    </ModeProvider>
  );
}
