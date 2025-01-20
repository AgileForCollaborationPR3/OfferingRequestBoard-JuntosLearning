<template>
  <q-page>
    <div v-if="learningItem">
      <!-- Fixed Top Header -->
      <q-toolbar class="bg-white text-primary" flat>
        <q-btn flat round dense icon="arrow_back" @click="goBack" />
        <q-toolbar-title class="lora text-h6 text-weight-bold text-center">
          {{ learningItem?.isRequest ? 'Learning Request Details' : 'Learning Offering Details' }}
        </q-toolbar-title>
      </q-toolbar>

      <!-- Learning Details -->
      <div class="bg-white q-pa-md">
        <!-- Stages -->
        <div class="row justify-between items-center q-mb-md">
          <q-chip v-for="stage in stages" :key="stage.name" :label="stage.name" :icon="stage.icon"
            :color="learningItem.stage === stage.name ? 'primary' : 'accent'"
            :text-color="learningItem.stage === stage.name ? 'white' : 'primary'" class="q-px-md" />
        </div>

        <!-- Title -->
        <div class="q-mb-lg q-mt-lg">
          <div class="text-body2 text-primary">
            {{ learningItem?.isRequest ? 'I want to learn ' : 'Learn' }}
          </div>
          <div class="lora text-h5 text-primary text-weight-bold">
            {{ learningItem?.title || 'Untitled' }}
          </div>
        </div>

        <!-- Posted By -->
        <div v-if="learningItem?.user" class="q-my-md">
          <div class="text-caption text-primary-50">POSTED BY</div>
          <UserProfileAvatar :firstName="learningItem?.user.firstName || 'User'"
            :lastName="learningItem?.user.lastName || 'Name'" :avatarSrc="learningItem?.user.avatarUrl || ''"
            :showInitialsOnly="false" avatarSize="24" fontSize="text-body2" bgColor="bg-white"
            textColor="text-primary" />
        </div>

        <!-- Preferences -->
        <div class="q-my-md">
          <div class="text-caption text-primary-50">PREFERENCES</div>
          <LearningChipsDetails :formats="learningItem?.formats" :location="learningItem?.location"
            :date="learningItem?.date" :min-age="learningItem?.minAge" :max-age="learningItem?.maxAge" />
        </div>

        <!-- Details -->
        <div v-if="learningItem?.details" class="q-my-md">
          <div class="text-caption text-primary-50">DETAILS</div>
          <div class="text-body1 text-primary">{{ learningItem.details }}</div>
        </div>

        <!-- Requirements -->
        <div v-if="learningItem?.requirements" class="q-my-md">
          <div class="text-caption text-primary-50">PRIOR KNOWLEDGE & EXPERIENCE</div>
          <div class="text-body1 text-primary">{{ learningItem.requirements }}</div>
        </div>

        <!-- Action Button -->
        <q-btn :label="learningItem?.isRequest ? 'Offer To Help' : 'Join Now'" color="primary"
          class="q-mt-md full-width" rounded @click="handleAction" />
      </div>

      <!-- Chat Section -->
      <div v-if="learningItem">
        <div class="bg-accent q-pa-md">
          <!-- Offer Chat Containers -->
          <div v-for="offer in offers" :key="offer.id">
            <LearningsPageChat :learningId="learningItem.id" :learningOfferId="offer.id" :messages="chatStore.messages.filter(
              msg => msg.learningOfferId === offer.id && !msg.parentMessageId
            )" />
          </div>
          <!-- General Messages -->
          <LearningsPageChat :learningId="learningItem.id" :messages="chatStore.messages.filter(
            msg => !msg.learningOfferId && !msg.parentMessageId
          )" />
        </div>
      </div>
    </div>

    <!-- Loading Placeholder -->
    <div v-else>
      <q-banner class="text-center text-primary">Loading...</q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useLearningsStore } from "../stores/learnings-store";
import { useChatStore } from "../stores/chat-store";
import UserProfileAvatar from "../components/commons/userProfileAvatar.vue";
import LearningChipsDetails from "src/components/commons/LearningChipsDetails.vue";
import LearningsPageChat from "src/components/LearningsPageChat.vue";

const route = useRoute();
const router = useRouter();
const learningsStore = useLearningsStore();
const chatStore = useChatStore();

const learningItem = ref(null);
const stages = [
  { name: "posted", icon: "bookmark" },
  { name: "scheduled", icon: "event" },
  { name: "completed", icon: "done" },
];
const offers = ref([]);

async function fetchLearningItem() {
  try {
    const learningId = route.params.id;
    if (!learningId) throw new Error("Invalid learning item ID.");

    const item = learningsStore.learningItems.find((i) => i.id === learningId);

    if (!item) {
      await learningsStore.fetchLearningItems(route.params.communityId);
      learningItem.value = learningsStore.learningItems.find((i) => i.id === learningId);
    } else {
      learningItem.value = item;
    }

    if (!learningItem.value) {
      throw new Error("Learning item not found.");
    }

    // Fetch associated learning offers
    await learningsStore.fetchLearningOffers(learningId);
    offers.value = learningsStore.learningOffers;

    // Fetch associated messages
    await chatStore.fetchMessagesOnLearningId(learningId);
  } catch (error) {
    console.error(error.message);
    router.back(); // Navigate back if item is not found
  }
}

function goBack() {
  router.back();
}

function handleAction() {
  router.push({
    name: "acceptLearning",
    params: { id: learningItem.value.id },
  });
}

onMounted(fetchLearningItem);
</script>

<style scoped></style>
