import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "../constants/colors";

type Message = {
  id: number;
  text: string;
  sender: "customer" | "owner";
  time: string;
};

export default function Chat() {
  const { ownerEmail, equipmentName } = useLocalSearchParams<{
    ownerEmail?: string;
    equipmentName?: string;
    equipmentId?: string;
  }>();

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const displayOwner =
    typeof ownerEmail === "string" && ownerEmail
      ? ownerEmail
      : "Equipment Owner";

  const displayEquipment =
    typeof equipmentName === "string" && equipmentName
      ? equipmentName
      : "Equipment";

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      text: trimmedMessage,
      sender: "customer",
      time: "Now",
    };

    setMessages((currentMessages) => [...currentMessages, newMessage]);

    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={23} color={colors.text} />
        </Pressable>

        <View style={styles.headerInfo}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
          </View>

          <View style={styles.ownerInfo}>
            <Text style={styles.ownerName}>Equipment Owner</Text>

            <Text style={styles.ownerEmail} numberOfLines={1}>
              {displayOwner}
            </Text>
          </View>
        </View>
      </View>

      {/* Equipment information */}
      <View style={styles.equipmentBox}>
        <Ionicons name="cube-outline" size={21} color={colors.primary} />

        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{displayEquipment}</Text>

          <Text style={styles.equipmentText}>
            Chat about this equipment rental
          </Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="chatbubbles-outline"
                size={32}
                color={colors.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>Start a conversation</Text>

            <Text style={styles.emptyText}>
              Ask the owner about availability, rental details, location, or
              anything else about this equipment.
            </Text>
          </View>
        ) : (
          messages.map((item) => (
            <View
              key={item.id}
              style={[
                styles.messageWrapper,
                item.sender === "customer"
                  ? styles.customerMessageWrapper
                  : styles.ownerMessageWrapper,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  item.sender === "customer"
                    ? styles.customerMessage
                    : styles.ownerMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.sender === "customer"
                      ? styles.customerMessageText
                      : styles.ownerMessageText,
                  ]}
                >
                  {item.text}
                </Text>

                <Text
                  style={[
                    styles.timeText,
                    item.sender === "customer"
                      ? styles.customerTime
                      : styles.ownerTime,
                  ]}
                >
                  {item.time}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Message input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.secondaryText}
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  ownerInfo: {
    flex: 1,
  },

  ownerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },

  ownerEmail: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },

  equipmentBox: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  equipmentInfo: {
    flex: 1,
    marginLeft: 10,
  },

  equipmentName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.text,
  },

  equipmentText: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 2,
  },

  messagesContainer: {
    flex: 1,
  },

  messagesContent: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 14,
  },

  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.secondaryText,
    textAlign: "center",
    marginTop: 7,
  },

  messageWrapper: {
    width: "100%",
    marginBottom: 10,
  },

  customerMessageWrapper: {
    alignItems: "flex-end",
  },

  ownerMessageWrapper: {
    alignItems: "flex-start",
  },

  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },

  customerMessage: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },

  ownerMessage: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  customerMessageText: {
    color: "#FFFFFF",
  },

  ownerMessageText: {
    color: colors.text,
  },

  timeText: {
    fontSize: 9,
    marginTop: 4,
  },

  customerTime: {
    color: "rgba(255,255,255,0.75)",
    textAlign: "right",
  },

  ownerTime: {
    color: colors.secondaryText,
  },

  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.text,
    marginRight: 8,
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
