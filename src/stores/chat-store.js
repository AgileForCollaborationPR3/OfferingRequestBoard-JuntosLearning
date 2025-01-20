import { defineStore } from "pinia";
import { db } from "../boot/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useProfileStore } from "./profile-store";

export const useChatStore = defineStore("chat-store", {
  state: () => ({
    messages: [], // Holds all chat messages
    loading: false,
    error: null,
  }),

  actions: {
    /** Fetch messages for a specific learningId **/
    async fetchMessagesOnLearningId(learningId) {
      this.loading = true;
      this.error = null;

      try {
        const messagesQuery = query(
          collection(db, "chatMessages"),
          where("learningId", "==", learningId)
        );
        const snapshot = await getDocs(messagesQuery);

        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const userIds = [...new Set(messages.map((msg) => msg.userId))];
        const profileStore = useProfileStore();
        const profiles = await profileStore.fetchProfiles(userIds);

        this.messages = messages.map((msg) => {
          const user =
            profiles.find((profile) => profile.userId === msg.userId) || {};
          return {
            ...msg,
            firstName: user.firstName || "Unknown",
            lastName: user.lastName || "",
            avatarUrl: user.avatarUrl || "",
          };
        });
      } catch (error) {
        console.error("Error fetching messages:", error.message);
        this.error = "Failed to fetch messages.";
      } finally {
        this.loading = false;
      }
    },

    /** Add a new message **/
    async addMessage(messageData) {
      if (!messageData.firstName || !messageData.lastName) {
        throw new Error("User profile details are missing.");
      }

      try {
        const chatRef = collection(db, "chatMessages");
        await addDoc(chatRef, {
          ...messageData,
          createdAt: new Date().toISOString(),
        });

        this.messages.push({
          ...messageData,
          id: Date.now().toString(), // Simulate a unique ID for local state
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error adding message:", error.message);
        throw new Error("Failed to add chat message.");
      }
    },
  },

  getters: {
    messagesByType: (state) => (type) =>
      state.messages.filter((msg) => msg.messageType === type),

    messagesByOfferId: (state) => (offerId) =>
      state.messages.filter((msg) => msg.learningOfferId === offerId),

    messagesByParticipationId: (state) => (participationId) =>
      state.messages.filter(
        (msg) => msg.learningParticipationId === participationId
      ),

    repliesByParentMessageId: (state) => (parentId) =>
      state.messages.filter((msg) => msg.parentMessageId === parentId),
  },
});
