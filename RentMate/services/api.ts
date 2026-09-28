import * as FileSystem from "expo-file-system/legacy";

const API_URL = "http://192.168.1.71:8080/api";

export type Equipment = {
  id: number;
  name: string;
  category: string;
  price: number;
  securityDeposit: number;
  location: string;
  description: string;
  available: boolean;
  ownerEmail: string;
  imageUrl: string | null;
};

export const getImageUrl = (imageUrl: string | null | undefined) => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `http://192.168.1.71:8080${imageUrl}`;
};

// ==================== EQUIPMENT API ====================

export const getEquipment = async (): Promise<Equipment[]> => {
  const response = await fetch(`${API_URL}/equipment`);

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return response.json();
};

export const getEquipmentById = async (id: number): Promise<Equipment> => {
  const response = await fetch(`${API_URL}/equipment/${id}`);

  if (!response.ok) {
    throw new Error("Equipment not found");
  }

  return response.json();
};

export const getEquipmentByOwnerEmail = async (
  email: string,
): Promise<Equipment[]> => {
  const response = await fetch(
    `${API_URL}/equipment/owner?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your equipment");
  }

  return response.json();
};

// ==================== EQUIPMENT IMAGE UPLOAD ====================

export const uploadEquipmentImage = async (
  imageUri: string,
): Promise<string> => {
  try {
    const fileName = imageUri.split("/").pop() || `equipment-${Date.now()}.jpg`;

    let mimeType = "image/jpeg";

    if (fileName.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
    } else if (fileName.toLowerCase().endsWith(".webp")) {
      mimeType = "image/webp";
    }

    const result = await FileSystem.uploadAsync(
      `${API_URL}/equipment/upload-image`,
      imageUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "image",
        mimeType: mimeType,
      },
    );

    console.log("Image upload status:", result.status);

    console.log("Image upload response:", result.body);

    if (result.status < 200 || result.status >= 300) {
      throw new Error("Failed to upload equipment image");
    }

    return result.body;
  } catch (error) {
    console.log("Equipment image upload failed:", error);

    throw error;
  }
};

// ==================== ADD EQUIPMENT ====================
export const addEquipment = async (equipment: {
  name: string;
  category: string;
  price: number;
  securityDeposit: number;
  location: string;
  description: string;
  available: boolean;
  ownerEmail: string;
  imageUrl?: string | null;
}): Promise<Equipment> => {
  const response = await fetch(`${API_URL}/equipment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    const responseText = await response.text();

    console.log("Add equipment status:", response.status);
    console.log("Add equipment response:", responseText);

    let message = "Failed to add equipment";

    try {
      const errorData = JSON.parse(responseText);

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      if (responseText.trim()) {
        message = responseText;
      }
    }

    throw new Error(message);
  }

  return response.json();
};
// ==================== UPDATE EQUIPMENT ====================

export const updateEquipment = async (
  id: number,
  equipment: {
    name: string;
    category: string;
    price: number;
    location: string;
    description: string;
    available: boolean;
    imageUrl?: string | null;
  },
): Promise<Equipment> => {
  const response = await fetch(`${API_URL}/equipment/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(equipment),
  });

  if (!response.ok) {
    let message = "Failed to update equipment";

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
};

// ==================== DELETE EQUIPMENT ====================

export const deleteEquipment = async (id: number) => {
  const response = await fetch(`${API_URL}/equipment/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete equipment");
  }
};
// ==================== RENTAL API ====================

export type RentalStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CASH_PENDING"
  | "ACTIVE"
  | "RETURN_REQUESTED"
  | "COMPLETED"
  | "CANCELLED";

export type Rental = {
  id: number;
  equipmentId: number;
  customerEmail: string;
  ownerEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  rentalFee: number;
  securityDeposit: number;
  totalAmount: number;
  status: RentalStatus;
  paymentMethod?: "ONLINE" | "CASH" | null;
  paymentStatus:
    | "NOT_STARTED"
    | "PENDING"
    | "PAID"
    | "CASH_PENDING"
    | "CANCELLED";
  transactionId?: string | null;
  paymentDate?: string | null;
  termsAccepted: boolean;
  termsAcceptedAt?: string | null;
  securityDepositStatus: "NOT_HELD" | "HELD" | "REFUNDED";
};

export const createRental = async (rental: {
  equipmentId: number;
  customerEmail: string;
  startDate: string;
  endDate: string;
}): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(rental),
  });

  if (!response.ok) {
    const responseText = await response.text();

    console.log("Create rental status:", response.status);
    console.log("Create rental response:", responseText);

    let message = "Failed to create rental";

    try {
      const errorData = JSON.parse(responseText);

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      if (responseText.trim()) {
        message = responseText;
      }
    }

    throw new Error(message);
  }

  return response.json();
};
export const getRentalById = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}`);

  if (!response.ok) {
    throw new Error("Rental not found");
  }

  return response.json();
};

export const getCustomerRentals = async (email: string): Promise<Rental[]> => {
  const response = await fetch(
    `${API_URL}/rentals/customer?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch your rentals");
  }

  return response.json();
};

export const getOwnerRentals = async (email: string): Promise<Rental[]> => {
  const response = await fetch(
    `${API_URL}/rentals/owner?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch rental requests");
  }

  return response.json();
};

export const acceptRental = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/accept`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to accept rental");
  }

  return response.json();
};

export const rejectRental = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/reject`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to reject rental");
  }

  return response.json();
};

export const payRentalOnline = async (
  id: number,
  termsAccepted: boolean,
): Promise<Rental> => {
  const response = await fetch(
    `${API_URL}/rentals/${id}/pay-online?termsAccepted=${termsAccepted}`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    let message = "Online payment failed";

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
};

export const selectCashPayment = async (
  id: number,
  termsAccepted: boolean,
): Promise<Rental> => {
  const response = await fetch(
    `${API_URL}/rentals/${id}/pay-cash?termsAccepted=${termsAccepted}`,
    {
      method: "PUT",
    },
  );

  if (!response.ok) {
    let message = "Unable to select cash payment";

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
};

export const confirmCashPayment = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/confirm-cash`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to confirm cash payment");
  }

  return response.json();
};

export const cancelRentalPayment = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/cancel-payment`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to cancel payment");
  }

  return response.json();
};

export const requestReturn = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/return`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to request return");
  }

  return response.json();
};
export const completeRental = async (id: number): Promise<Rental> => {
  const response = await fetch(`${API_URL}/rentals/${id}/complete`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to complete rental");
  }

  return response.json();
};

// ==================== AUTH API ====================

export type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "USER" | "ADMIN";
  citizenshipProvided: boolean;
  citizenshipUrl: string | null;
};

export const registerUser = async (user: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    let message = "Registration failed";

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    let message = "Invalid email or password";

    try {
      const errorData = await response.json();

      if (errorData.message) {
        message = errorData.message;
      }
    } catch {}

    throw new Error(message);
  }

  return response.json();
};

// ==================== ADMIN - USERS ====================

export const getAllAdminUsers = async (): Promise<User[]> => {
  const response = await fetch(`${API_URL}/admin/users`);

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

export const deleteAdminUser = async (id: number) => {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
};

// ==================== ADMIN - EQUIPMENT ====================

export const getAllAdminEquipment = async (): Promise<Equipment[]> => {
  const response = await fetch(`${API_URL}/admin/equipment`);

  if (!response.ok) {
    throw new Error("Failed to fetch equipment");
  }

  return response.json();
};

export const deleteAdminEquipment = async (id: number) => {
  const response = await fetch(`${API_URL}/admin/equipment/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete equipment");
  }
};

// ==================== ADMIN - RENTALS ====================

export const getAllAdminRentals = async (): Promise<Rental[]> => {
  const response = await fetch(`${API_URL}/admin/rentals`);

  if (!response.ok) {
    throw new Error("Failed to fetch rentals");
  }

  return response.json();
};

// ==================== NOTIFICATION API ====================

export type Notification = {
  id: number;
  recipientEmail: string;
  title: string;
  message: string;
  rentalId: number | null;
  read: boolean;
  createdAt: string;
};

export const getUserNotifications = async (
  email: string,
): Promise<Notification[]> => {
  const response = await fetch(
    `${API_URL}/notifications?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

export const markNotificationAsRead = async (
  id: number,
): Promise<Notification> => {
  const response = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PUT",
  });

  if (!response.ok) {
    throw new Error("Failed to mark notification as read");
  }

  return response.json();
};

// ==================== CITIZENSHIP API ====================

export const getCitizenshipStatus = async (email: string): Promise<boolean> => {
  const response = await fetch(
    `${API_URL}/users/citizenship/status?email=${encodeURIComponent(email)}`,
  );

  if (!response.ok) {
    throw new Error("Unable to check citizenship status");
  }

  const data = await response.json();

  return data.provided === true;
};

export const submitCitizenship = async (
  email: string,
  citizenshipUri: string,
): Promise<User> => {
  try {
    const fileName =
      citizenshipUri.split("/").pop() || `citizenship-${Date.now()}.jpg`;

    let mimeType = "image/jpeg";

    if (fileName.toLowerCase().endsWith(".png")) {
      mimeType = "image/png";
    } else if (fileName.toLowerCase().endsWith(".webp")) {
      mimeType = "image/webp";
    }

    const result = await FileSystem.uploadAsync(
      `${API_URL}/users/citizenship?email=${encodeURIComponent(email)}`,
      citizenshipUri,
      {
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: "citizenship",
        mimeType: mimeType,
      },
    );

    console.log("Citizenship upload status:", result.status);

    console.log("Citizenship upload response:", result.body);

    if (result.status < 200 || result.status >= 300) {
      throw new Error("Failed to submit citizenship");
    }

    return JSON.parse(result.body);
  } catch (error) {
    console.log("Citizenship upload failed:", error);

    throw error;
  }
};
