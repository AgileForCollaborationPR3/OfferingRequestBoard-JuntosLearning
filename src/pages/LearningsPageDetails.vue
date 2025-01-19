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
          <div class="text-caption text-primary-80">POSTED BY</div>
          <UserProfileAvatar :firstName="learningItem?.user.firstName || 'User'"
            :lastName="learningItem?.user.lastName || 'Name'" :avatarSrc="learningItem?.user.avatarUrl || ''"
            :showInitialsOnly="false" avatarSize="24" fontSize="text-body2" bgColor="bg-white"
            textColor="text-primary" />
        </div>

        <!-- Preferences -->
        <div class="q-my-md">
          <div class="text-caption text-primary-80">PREFERENCES</div>
          <LearningChipsDetails :formats="learningItem?.formats" :location="learningItem?.location"
            :date="learningItem?.date" :min-age="learningItem?.minAge" :max-age="learningItem?.maxAge" />
        </div>

        <!-- Details -->
        <div v-if="learningItem?.details" class="q-my-md">
          <div class="text-caption text-primary-80">DETAILS</div>
          <div class="text-body1 text-primary-80">{{ learningItem.details }}</div>
        </div>

        <!-- Requirements -->
        <div v-if="learningItem?.requirements" class="q-my-md">
          <div class="text-caption text-primary-80">PRIOR KNOWLEDGE & EXPERIENCE</div>
          <div class="text-body1 text-primary-80">{{ learningItem.requirements }}</div>
        </div>

        <!-- Action Button -->
        <q-btn :label="learningItem?.isRequest ? 'Offer To Help' : 'Join Now'" color="primary"
          class="q-mt-md full-width" rounded @click="handleAction" />
      </div>

      <!-- Additional Offers -->
      <div class="bg-accent q-pa-md">
        <div class="text-body2 text-primary text-weight-bold">OFFERS</div>
        <!-- Offer Component -->
        <div><!-- offer component placeholder --></div>
      </div>
    </div>

    <!-- Loading Placeholder -->
    <div v-else>
      <q-banner class="text-center text-primary">Loading...</q-banner>
    </div>
  </q-page>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearningsStore } from '../stores/learnings-store';
import UserProfileAvatar from '../components/commons/userProfileAvatar.vue';
import LearningChipsDetails from 'src/components/commons/LearningChipsDetails.vue';

const route = useRoute();
const router = useRouter();
const learningsStore = useLearningsStore();

const learningItem = ref(null);
const stages = [{ name: 'posted', icon: 'bookmark' }, { name: 'scheduled', icon: 'event' }, { name: 'completed', icon: 'done' }];


async function fetchLearningItem() {
  try {
    const learningId = route.params.id;
    if (!learningId) throw new Error('Invalid learning item ID.');

    const item = learningsStore.learningItems.find((i) => i.id === learningId);
    if (!item) {
      await learningsStore.fetchLearningItems(); // Fetch data if not in store
      learningItem.value = learningsStore.learningItems.find((i) => i.id === learningId);
    } else {
      learningItem.value = item;
    }

    if (!learningItem.value) {
      throw new Error('Learning item not found.');
    }
  } catch (error) {
    console.error(error.message);
    router.back(); // Navigate back if item not found
  }
}

function goBack() {
  router.back();
}

function handleAction() {
  console.log(
    learningItem.value.isRequest
      ? 'Offering help for this learning request.'
      : 'Requesting help for this learning offering.'
  );

  router.push({
    name: 'acceptLearning',
    params: { id: learningItem.value.id }, // Pass the learning item ID
  });
}

onMounted(fetchLearningItem);
</script>

<style scoped></style>
