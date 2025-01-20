<template>
  <div class="chat-container q-pa-md">
    <!-- Display request and offer messages -->
    <div class="bg-white q-pa-sm" style="border-radius:10px;">
      <div v-for="message in messages" :key="message.id" class="special-message q-mb-md">
        <div v-if="!message.parentMessageId">
          <div class="row">
            <div class="col-7">
              <UserProfileAvatar :firstName="message?.firstName || 'User'" :lastName="message?.lastName || 'Name'"
                :avatarSrc="message?.avatarUrl || ''" :showInitialsOnly="false" avatarSize="24" fontSize="text-body2"
                bgColor="bg-white" textColor="text-primary" />
            </div>
            <div class="col-4 text-right">
              <!-- Accept Offer Button -->
              <q-btn v-if="message.messageType === 'offer'"
                :label="message.learningOfferId === acceptedOfferId ? 'Offer Accepted' : 'Accept Offer'"
                :color="message.learningOfferId === acceptedOfferId ? 'practicing' : 'primary'" size="sm"
                :disabled="!!acceptedOfferId" @click="acceptOffer(message.learningOfferId)"
                v-show="isCreator || message.learningOfferId === acceptedOfferId" no-caps rounded />

              <!-- Can Join Button for Request -->
              <q-btn v-if="message.messageType === 'request'"
                :label="isParticipant(message.userId) ? 'Participant' : 'Can Join'"
                :color="isParticipant(message.userId) ? 'primary' : 'secondary'" size="sm"
                :disabled="acceptedParticipations.length >= maxPeople || isParticipant(message.userId)"
                @click="acceptParticipant(message.userId)" v-show="isCreator" no-caps rounded />
            </div>
          </div>
          <div class="text-primary text-body1" style="padding-left:36px;">
            <p>{{ message.reason }}</p>
          </div>
          <div style="padding-left:28px;">
            <q-btn label="reply" icon="reply" size="sm" color="primary-50" dense flat @click="showInput = true"></q-btn>
          </div>
          <q-separator />
        </div>

        <div v-else>
          <UserProfileAvatar :firstName="message?.firstName || 'User'" :lastName="message?.lastName || 'Name'"
            :avatarSrc="message?.avatarUrl || ''" :showInitialsOnly="false" avatarSize="24" fontSize="text-body2"
            bgColor="bg-white" textColor="text-primary" />
          <div class="text-primary text-body1" style="padding-left:36px;">
            <p>{{ message.message }}</p>
          </div>
        </div>
      </div>

      <!-- Input field for new messages -->
      <q-input v-if="showInput" v-model="newMessage" placeholder="Type your message..." outlined dense
        @keyup.enter="handleSend">
        <template #append>
          <q-btn flat round dense icon="send" color="primary" @click="handleSend" />
        </template>
      </q-input>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useChatStore } from "../stores/chat-store";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import UserProfileAvatar from "./commons/userProfileAvatar.vue";
import { useLearningsStore } from "../stores/learnings-store";

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
const learningsStore = useLearningsStore();

const newMessage = ref("");
const loading = ref(false);
const showInput = ref(false);

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

// Check if the current user is the creator of the learning item
const isCreator = computed(() => {
  const learningItem = learningsStore.learningItems.find(
    (item) => item.id === props.learningId
  );
  return learningItem?.userId === authStore.user?.uid;
})

// Accept offer handler
async function acceptOffer(learningOfferId) {
  try {
    await learningsStore.acceptLearningOffer(props.learningId, learningOfferId);
  } catch (error) {
    console.error("Failed to accept offer:", error.message);
  }
}

// Manage the state of the Can Join button

const maxPeople = computed(() => {
  const learningItem = learningsStore.learningItems.find((item) => item.id === props.learningId);
  return learningItem?.maxPeople || 0;
});

const acceptedParticipations = computed(() => {
  const learningItem = learningsStore.learningItems.find((item) => item.id === props.learningId);
  return learningItem?.acceptedParticipationsId || [];
});

function isParticipant(userId) {
  return acceptedParticipations.value.includes(userId);
}

// Add Participant
async function acceptParticipant(userId) {
  try {
    await learningsStore.addParticipant(props.learningId, userId);
  } catch (error) {
    console.error("Failed to accept participant:", error.message);
  }
}

// Get the accepted offer ID
const acceptedOfferId = computed(() => {
  const learningItem = learningsStore.learningItems.find(
    (item) => item.id === props.learningId
  );
  return learningItem?.acceptedOfferId || null;
});

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
      message: newMessage.value,
      userId,
      parentMessageId: messages.value[0]?.id,
      firstName: profile.firstName || "Unknown",
      lastName: profile.lastName || "",
      avatarUrl: profile.avatarUrl || "",
      messageType: 'normal',
      createdAt: new Date().toISOString(),
    });

    // Clear the input field
    newMessage.value = "";
    showInput.value = false;
  } catch (error) {
    console.error("Failed to send message:", error.message);
  }
}

onMounted(async () => {
  try {
    loading.value = true;
    await chatStore.fetchMessagesOnLearningId(props.learningId);
  } catch (error) {
    console.error("Failed to fetch messages:", error.message);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped></style>
