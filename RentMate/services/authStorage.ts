import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_EMAIL_KEY = "current_user_email";
const CURRENT_USER_ROLE_KEY = "current_user_role";
const CURRENT_USER_NAME_KEY = "current_user_name";

export const setCurrentUserEmail = async (email: string) => {
  await AsyncStorage.setItem(
    CURRENT_USER_EMAIL_KEY,
    email.trim().toLowerCase(),
  );
};

export const getCurrentUserEmail = async () => {
  return await AsyncStorage.getItem(CURRENT_USER_EMAIL_KEY);
};

export const clearCurrentUserEmail = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_EMAIL_KEY);
};

export const setCurrentUserRole = async (role: "USER" | "ADMIN") => {
  await AsyncStorage.setItem(CURRENT_USER_ROLE_KEY, role);
};

export const getCurrentUserRole = async () => {
  return await AsyncStorage.getItem(CURRENT_USER_ROLE_KEY);
};

export const clearCurrentUserRole = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_ROLE_KEY);
};

export const setCurrentUserName = async (name: string) => {
  await AsyncStorage.setItem(CURRENT_USER_NAME_KEY, name.trim());
};

export const getCurrentUserName = async () => {
  return await AsyncStorage.getItem(CURRENT_USER_NAME_KEY);
};

export const clearCurrentUserName = async () => {
  await AsyncStorage.removeItem(CURRENT_USER_NAME_KEY);
};
