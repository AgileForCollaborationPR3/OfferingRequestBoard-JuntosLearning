<template>
  <q-page>
    <!-- Sticky Header Section -->
    <q-page-sticky position="top-left" :offset="[0, 0]" style="z-index: 3" class="bg-lpage full-width">
      <q-toolbar class="text-primary" :style="{ width: $q.screen.width + 'px' }">
        <q-toolbar-title class="lora text-h6 text-weight-bold text-primary">
          My Learnings
        </q-toolbar-title>
        <q-btn flat round text-color="primary" dense icon="o_notifications" />
      </q-toolbar>

      <div class="row items-center">
        <div class="col-8 q-pl-sm">
          <q-select dense rounded standout v-model="selectedCommunity" :options="communityOptions"
            label="Select Community" color="white" label-color="primary" bg-color="white" />
        </div>
        <div class="col-2 q-pl-sm">
          <q-btn label="filter" icon="o_filter_list" color="primary" size="sm" flat no-caps rounded dense />
        </div>
        <div class="col-2">
          <q-btn label="sort" icon="o_sort" color="primary" size="sm" flat no-caps rounded dense />
        </div>
      </div>
    </q-page-sticky>

    <!-- Content -->
    <div class="q-pa-md bg-lpage text-primary" :style="{ paddingTop: '110px' }">
      <div v-for="learning in learningsStore.learningItems" :key="learning.id" class="q-mb-md"
        @click="goToLearningDetails(learning.id)" style="cursor: pointer;">
        <LearningsPageDetailsCard :title="learning.title || 'Untitled'" :formats="learning.formats || []"
          :type="learning.type || ''" :stage="learning.stage || 'unknown'" :offers="learning.offers || 0"
          :requests="learning.requests || 0" :location="learning.location || 'N/A'" :isRequest="learning.isRequest"
          :avatarUrl="learning.user?.avatarUrl || ''" :maxAge="learning.maxAge || 'N/A'"
          :minAge="learning.minAge || 'N/A'" :date="learning.date || 'N/A'" :userId="learning.userId" />
      </div>

      <!-- Show loading or no data message -->
      <q-banner v-if="isLoading" class="q-my-md text-center">
        Loading...
      </q-banner>
      <q-banner v-else-if="!learningsStore.learningItems.length" class="q-my-md text-center">
        No learnings available.
      </q-banner>

      <!-- Floating Action Add Button -->
      <q-page-sticky position="bottom-right" :offset="[18, 18]">
        <q-fab color="primary" text-color="lpage" icon="add" direction="up" vertical-actions-align="right">
          <q-fab-action color="primary" text-color="lpage" @click="goToAdd(true)" label="Request" />
          <q-fab-action color="primary" text-color="lpage" @click="goToAdd(false)" label="Offering" />
        </q-fab>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script setup>
import { useQuasar } from "quasar";
import { ref, watch, onMounted, computed } from "vue";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import { useLearningsStore } from "../stores/learnings-store";
import LearningsPageDetailsCard from "../components/LearningsPageDetailsCard.vue";
import { useRouter } from "vue-router";

const $q = useQuasar();
const router = useRouter();
const communityStore = useAuthCommunityStore();
const learningsStore = useLearningsStore();
const selectedCommunity = ref(null);
const isLoading = ref(true);

// Derived community options for the dropdown
const communityOptions = computed(() =>
  communityStore.communities.map((community) => ({
    label: community.name,
    value: community.id,
  }))
);

// Navigate to add learning item
const goToAdd = (isRequest) => {
  router.push({ name: "add", params: { isRequest } });
};

// Navigate to learning details page
const goToLearningDetails = (learningId) => {
  router.push({ name: "learningDetails", params: { id: learningId } });
};

// Fetch learning items on mounted
onMounted(async () => {
  if (communityStore.profile?.currentCommunityId) {
    selectedCommunity.value = communityStore.profile.currentCommunityId;
    await fetchLearningItems(selectedCommunity.value);
  }
});

// Fetch learning items when community changes
watch(selectedCommunity, async (newCommunity) => {
  if (newCommunity) {
    isLoading.value = true; // Set loading state
    await fetchLearningItems(newCommunity);
  }
});

// Fetch learning items from the store
const fetchLearningItems = async (communityId) => {
  try {
    await learningsStore.fetchLearningItems(communityId);
  } catch (error) {
    console.error("Failed to fetch learning items:", error);
    $q.notify({
      type: "negative",
      message: "Unable to fetch learning items. Please try again later.",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped></style>
