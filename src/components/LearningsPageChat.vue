<template>
  <q-card class="q-pa-md q-mb-md">
    <!-- Display chat messages -->
    <q-chat-message v-for="message in messages" :key="message.id" :name="message.firstName + ' ' + message.lastName"
      :avatar="getAvatarUrl(message.userId)" :stamp="formatTimestamp(message.createdAt)">
      <!-- Offer Message Details -->
      <template v-if="message.messageType === 'offer'">
        <div>
          <strong>Offer Details:</strong>
          <p v-for="(value, key) in message.preferences" :key="key">
            {{ key }}: {{ value }}
          </p>
          <p><strong>Reason:</strong> {{ message.message }}</p>
        </div>
      </template>

      <!-- Request Message Details -->
      <template v-else-if="message.messageType === 'request'">
        <div>
          <p><strong>Reason:</strong> {{ message.message }}</p>
        </div>
      </template>

      <!-- Normal Message -->
      <template v-else>
        <p>{{ message.message }}</p>
      </template>

      <!-- Add nested replies -->
      <MessageReplies :replies="messages.filter(reply => reply.parentMessageId === message.id)"
        @reply="setReplyToMessage(message.id)" />
    </q-chat-message>

    <!-- Input field for new messages -->
    <q-input v-model="newMessage" placeholder="Type your message..." outlined dense @keyup.enter="handleSend">
      <template #append>
        <q-btn flat round dense icon="send" color="primary" @click="handleSend" />
      </template>
    </q-input>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useChatStore } from "../stores/chat-store";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import MessageReplies from "./commons/MessageReplies.vue";

// Props
const props = defineProps({
  learningId: {
    type: String,
    required: true,
  },
  learningOfferId: {
    type: String,
    default: null,
  },
  learningParticipationId: {
    type: String,
    default: null,
  },
});

const chatStore = useChatStore();
const authStore = useAuthCommunityStore();

const newMessage = ref("");
const replyToMessageId = ref(null); // To track reply-to messages
const loading = ref(false);
const defaultAvatar = "https://via.placeholder.com/150";

// Computed property for filtering messages
const messages = computed(() => {
  if (props.learningOfferId) {
    return chatStore.messagesByOfferId(props.learningOfferId);
  } else if (props.learningParticipationId) {
    return chatStore.messagesByParticipationId(props.learningParticipationId);
  } else {
    return chatStore.messagesByType("normal");
  }
});

// Utility function to format timestamps
function formatTimestamp(timestamp) {
  if (!timestamp) return "Invalid date";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Fetch messages when the component is mounted
async function fetchMessages() {
  try {
    loading.value = true;
    await chatStore.fetchMessagesOnLearningId(props.learningId);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
  } finally {
    loading.value = false;
  }
}

// Method to get the avatar URL dynamically
function getAvatarUrl(userId) {
  if (userId === authStore.user?.uid) {
    return authStore.profile?.avatarUrl || defaultAvatar;
  }
  const user = chatStore.getUserProfile(userId); // Implement or fetch from your store
  return user?.avatarUrl || defaultAvatar;
}

// Handle sending a new message
async function handleSend() {
  if (!newMessage.value.trim()) return;

  try {
    const userId = authStore.user?.uid || null;
    const profile = authStore.profile || {};

    if (!userId) {
      throw new Error("User ID is missing. Ensure the user is logged in.");
    }

    // Add the message to the database
    await chatStore.addMessage({
      learningId: props.learningId,
      learningOfferId: props.learningOfferId || null,
      learningParticipationId: props.learningParticipationId || null,
      parentMessageId: replyToMessageId.value || null, // Set parentMessageId for replies
      message: newMessage.value,
      userId,
      firstName: profile.firstName || "Unknown",
      lastName: profile.lastName || "",
      avatarUrl: profile.avatarUrl || "",
      messageType: props.learningOfferId
        ? "offer"
        : props.learningParticipationId
          ? "request"
          : "normal",
      createdAt: new Date().toISOString(),
    });

    // Clear the input field and reply tracking
    newMessage.value = "";
    replyToMessageId.value = null;
  } catch (error) {
    console.error("Failed to send message:", error.message);
  }
}

// Set reply-to message ID
function setReplyToMessage(messageId) {
  replyToMessageId.value = messageId;
}

onMounted(fetchMessages);
</script>
