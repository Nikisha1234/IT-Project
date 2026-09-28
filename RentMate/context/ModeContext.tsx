import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Mode = "customer" | "renter";

type ModeContextType = {
  mode: Mode;
  setMode: (mode: Mode) => Promise<void>;
  loading: boolean;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

const MODE_KEY = "@rentequip_mode";

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("customer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(MODE_KEY);

        if (savedMode === "customer" || savedMode === "renter") {
          setModeState(savedMode);
        }
      } catch (error) {
        console.error("Error loading mode:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMode();
  }, []);

  const setMode = async (newMode: Mode) => {
    try {
      setModeState(newMode);

      await AsyncStorage.setItem(MODE_KEY, newMode);
    } catch (error) {
      console.error("Error saving mode:", error);
    }
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        loading,
      }}
    >
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);

  if (!context) {
    throw new Error("useMode must be used inside ModeProvider");
  }

  return context;
}
