import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../constants/colors";
import {
  deleteEquipment,
  Equipment,
  getCustomerRentals,
  getEquipmentById,
  getImageUrl,
  Rental,
} from "../services/api";
import { getCurrentUserEmail } from "../services/authStorage";

export default function EquipmentDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [item, setItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [existingRental, setExistingRental] = useState<Rental | null>(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);

  useEffect(() => {
    loadEquipment();
    loadUserAndRental();
  }, [id]);

  const loadEquipment = async () => {
    try {
      setLoading(true);

      if (!id) {
        throw new Error("Equipment ID is missing");
      }

      const data = await getEquipmentById(Number(id));
      setItem(data);
    } catch (error) {
      console.error("Error loading equipment:", error);
      Alert.alert("Error", "Unable to load equipment details.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadUserAndRental = async () => {
    try {
      const email = await getCurrentUserEmail();

      if (!email || !id) {
        return;
      }

      const normalizedEmail = email.toLowerCase();
      setCurrentUserEmail(normalizedEmail);

      const rentals = await getCustomerRentals(normalizedEmail);

      const rentalForThisEquipment = rentals
        .filter((rental) => rental.equipmentId === Number(id))
        .filter(
          (rental) =>
            rental.status === "PENDING" ||
            rental.status === "PAYMENT_PENDING" ||
            rental.status === "ACTIVE" ||
            rental.status === "RETURN_REQUESTED",
        )
        .sort((a, b) => b.id - a.id)[0];

      setExistingRental(rentalForThisEquipment ?? null);
    } catch (error) {
      console.error("Error loading rental status:", error);
      setExistingRental(null);
    }
  };

  const handleDelete = () => {
    if (!item) return;

    Alert.alert(
      "Delete Equipment",
      "Are you sure you want to delete this equipment listing?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);

              await deleteEquipment(item.id);

              Alert.alert("Deleted", "Equipment listing has been deleted.", [
                {
                  text: "OK",
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Unable to delete equipment.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Equipment not found.</Text>
      </View>
    );
  }

  const isOwner =
    currentUserEmail &&
    item.ownerEmail &&
    currentUserEmail === item.ownerEmail.toLowerCase();

  const imageUrl = getImageUrl(item.imageUrl);

  const hasPendingRental = existingRental?.status === "PENDING";
  const hasPaymentPendingRental = existingRental?.status === "PAYMENT_PENDING";
  const hasActiveRental = existingRental?.status === "ACTIVE";
  const hasReturnRequested = existingRental?.status === "RETURN_REQUESTED";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Equipment Details</Text>

        {isOwner ? (
          <Pressable
            style={styles.headerButton}
            onPress={() =>
              router.push({
                pathname: "/edit-equipment",
                params: {
                  id: item.id.toString(),
                },
              })
            }
          >
            <Ionicons name="create-outline" size={22} color={colors.primary} />
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
      </View>

      {/* Equipment Image */}
      {imageUrl ? (
        <Pressable
          style={styles.mainImageContainer}
          onPress={() => setImageViewerVisible(true)}
        >
          <Image
            source={{ uri: imageUrl }}
            style={styles.mainImage}
            resizeMode="contain"
          />

          <View style={styles.zoomIcon}>
            <Ionicons name="expand-outline" size={20} color={colors.white} />
          </View>
        </Pressable>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons
            name="image-outline"
            size={50}
            color={colors.secondaryText}
          />

          <Text style={styles.placeholderText}>No image available</Text>
        </View>
      )}

      <View style={styles.detailsContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleArea}>
            <Text style={styles.name}>{item.name}</Text>

            <View
              style={[
                styles.availabilityBadge,
                item.available
                  ? styles.availableBadge
                  : styles.unavailableBadge,
              ]}
            >
              <Text
                style={[
                  styles.availabilityText,
                  item.available
                    ? styles.availableText
                    : styles.unavailableText,
                ]}
              >
                {item.available ? "Available" : "Unavailable"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.priceCard}>
          <View style={styles.priceIcon}>
            <Ionicons name="cash-outline" size={22} color={colors.primary} />
          </View>

          <View>
            <Text style={styles.infoLabel}>Rental Price</Text>

            <Text style={styles.price}>
              Rs. {item.price.toLocaleString()}/day
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>

              <Text style={styles.infoValue}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={colors.primary}
            />

            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Security Deposit</Text>

              <Text style={styles.infoValue}>
                Rs. {(item.securityDeposit ?? 0).toLocaleString()}
              </Text>

              <Text style={styles.depositNote}>
                Refundable after successful return
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Description</Text>

          <Text style={styles.description}>
            {item.description?.trim()
              ? item.description
              : "No description provided."}
          </Text>
        </View>

        {!isOwner && (
          <Pressable
            style={styles.chatButton}
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: {
                  ownerEmail: item.ownerEmail,
                  equipmentName: item.name,
                  equipmentId: item.id.toString(),
                },
              })
            }
          >
            <Ionicons
              name="chatbubble-outline"
              size={19}
              color={colors.primary}
            />

            <Text style={styles.chatButtonText}>Chat with Owner</Text>
          </Pressable>
        )}

        {isOwner ? (
          <View style={styles.ownerActions}>
            <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/edit-equipment",
                  params: {
                    id: item.id.toString(),
                  },
                })
              }
            >
              <Ionicons name="create-outline" size={19} color={colors.white} />

              <Text style={styles.actionButtonText}>Edit Equipment</Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.white}
                  />

                  <Text style={styles.actionButtonText}>Delete Equipment</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : hasPendingRental ? (
          <View style={styles.statusContainer}>
            <Ionicons name="time-outline" size={22} color={colors.primary} />

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Rental Request Pending</Text>

              <Text style={styles.statusMessage}>
                Your rental request is waiting for the owner's approval.
              </Text>
            </View>
          </View>
        ) : hasPaymentPendingRental ? (
          <View style={styles.statusContainer}>
            <Ionicons name="card-outline" size={22} color={colors.primary} />

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Payment Required</Text>

              <Text style={styles.statusMessage}>
                Your rental request has been accepted. Complete the payment from
                My Rentals.
              </Text>
            </View>
          </View>
        ) : hasActiveRental ? (
          <View style={styles.statusContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={colors.primary}
            />

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Currently Rented</Text>

              <Text style={styles.statusMessage}>
                You are currently renting this equipment.
              </Text>
            </View>
          </View>
        ) : hasReturnRequested ? (
          <View style={styles.statusContainer}>
            <Ionicons
              name="return-up-back-outline"
              size={22}
              color={colors.primary}
            />

            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>Return Requested</Text>

              <Text style={styles.statusMessage}>
                Your return request is waiting for the owner's confirmation.
              </Text>
            </View>
          </View>
        ) : item.available ? (
          <Pressable
            style={styles.rentButton}
            onPress={() =>
              router.push({
                pathname: "./rental-details",
                params: {
                  equipmentId: item.id.toString(),
                },
              })
            }
          >
            <Ionicons name="calendar-outline" size={20} color={colors.white} />

            <Text style={styles.rentButtonText}>Rent Now</Text>
          </Pressable>
        ) : (
          <View style={styles.unavailableContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.secondaryText}
            />

            <Text style={styles.unavailableMessage}>
              This equipment is currently unavailable.
            </Text>
          </View>
        )}
      </View>

      {/* Full Screen Image Viewer */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={styles.imageModal}>
          <Pressable
            style={styles.closeImageButton}
            onPress={() => setImageViewerVisible(false)}
          >
            <Ionicons name="close" size={28} color={colors.white} />
          </Pressable>

          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },

  errorText: {
    color: colors.secondaryText,
    fontSize: 15,
  },

  header: {
    height: 95,
    paddingTop: 45,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },

  headerTitle: {
    flex: 1,
    fontSize: 23,
    fontWeight: "bold",
    color: colors.text,
  },

  headerButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  mainImageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  mainImage: {
    width: "100%",
    height: "100%",
  },

  zoomIcon: {
    position: "absolute",
    right: 14,
    bottom: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },

  imagePlaceholder: {
    width: "100%",
    height: 280,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderText: {
    marginTop: 8,
    color: colors.secondaryText,
    fontSize: 13,
  },

  detailsContainer: {
    padding: 20,
  },

  titleRow: {
    marginBottom: 18,
  },

  titleArea: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  name: {
    flex: 1,
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
  },

  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  unavailableBadge: {
    backgroundColor: "#F1F1F3",
  },

  availabilityText: {
    fontSize: 12,
    fontWeight: "700",
  },

  availableBadge: {
    backgroundColor: "#E8F5E9",
  },

  availableText: {
    color: "#2E7D32",
  },

  unavailableText: {
    color: colors.secondaryText,
  },

  priceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },

  priceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 3,
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
  },

  depositNote: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 15,
  },

  descriptionSection: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: colors.secondaryText,
    lineHeight: 21,
  },

  chatButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },

  chatButtonText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 15,
  },

  rentButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  rentButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  ownerActions: {
    gap: 10,
  },

  editButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  deleteButton: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.danger,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  actionButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },

  statusContainer: {
    minHeight: 65,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 12,
  },

  statusTextContainer: {
    flex: 1,
  },

  statusTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  statusMessage: {
    color: colors.secondaryText,
    fontSize: 13,
    lineHeight: 18,
  },

  unavailableContainer: {
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 15,
  },

  unavailableMessage: {
    color: colors.secondaryText,
    fontSize: 14,
  },

  imageModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },

  fullImage: {
    width: "100%",
    height: "80%",
  },

  closeImageButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
});
