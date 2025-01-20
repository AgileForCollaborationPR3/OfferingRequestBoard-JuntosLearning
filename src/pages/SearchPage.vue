<template>
  <q-page>
    <q-page-sticky position="top-left" :offset="[0, 0]" style="z-index: 3" class="bg-lpage full-width">
      <q-toolbar class="text-primary" :style="{ width: $q.screen.width + 'px' }">
        <q-toolbar-title class="lora text-h6 text-weight-bold text-primary">
          Community
        </q-toolbar-title>
        <q-btn flat round text-color="primary" dense icon="o_notifications" />
        <q-btn flat round text-color="primary" dense icon="o_person" @click="router.push('/details')" />
      </q-toolbar>

      <div class="row items-center">
        <div class="col-8 q-pl-sm">
          <q-select
            dense
            rounded
            standout
            v-model="selectedCommunity"
            :options="communityOptions"
            label="Select Community"
            color="white"
            label-color="primary"
            bg-color="white"
          />
        </div>
        <div class="col-2 q-pl-sm">
          <q-btn label="filter" icon="o_filter_list" color="primary" size="sm" flat no-caps rounded dense></q-btn>
        </div>
        <div class="col-2">
          <q-btn label="sort" icon="o_sort" color="primary" size="sm" flat no-caps rounded dense></q-btn>
        </div>
      </div>
    </q-page-sticky>

    <div class="bg-lpage q-mt-md" :style="{ paddingTop: '75px', minHeight: 'Calc(100vh - 75px)' }">
      <!-- Tab Panel -->
      <q-tabs v-model="tab" dense active-color="primary" class="q-mb-md">
        <q-tab name="offerings" label="Offerings" />
        <q-tab name="requests" label="Requests" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <!-- Offerings Tab -->
        <q-tab-panel name="offerings" class="bg-lpage">
          <div v-if="isLoading" class="text-center q-my-md">Loading...</div>
          <div v-else-if="offerings.length === 0" class="text-center q-my-md">No offerings available.</div>
          <div v-else>
            <div v-for="learning in offerings" :key="learning.id" class="q-mb-md" @click="goToLearningDetails(learning.id)" style="cursor: pointer;">
              <LearningsPageDetailsCard
              :title="learning.title || 'Untitled'"
                :formats="learning.formats || []"
                :type="learning.type || ''"
                :stage="learning.stage || 'unknown'"
                :offers="learning.offers || 0"
                :requests="learning.requests || 0"
                :location="learning.location || 'N/A'"
                :isRequest="learning.isRequest"
                :maxAge="learning.maxAge || 'N/A'"
                :minAge="learning.minAge || 'N/A'"
                :date="learning.date || 'N/A'"
                :userId="learning.userId ||''"
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Requests Tab -->
        <q-tab-panel name="requests" class="bg-lpage">
          <div v-if="isLoading" class="text-center q-my-md">Loading...</div>
          <div v-else-if="requests.length === 0" class="text-center q-my-md">No requests available.</div>
          <div v-else>
            <div v-for="learning in requests" :key="learning.id" class="q-mb-md" @click="goToLearningDetails(learning.id)" style="cursor: pointer;">
              <LearningsPageDetailsCard
                :title="learning.title || 'Untitled'"
                :formats="learning.formats || []"
                :type="learning.type || ''"
                :stage="learning.stage || 'unknown'"
                :offers="learning.offers || 0"
                :requests="learning.requests || 0"
                :location="learning.location || 'N/A'"
                :isRequest="learning.isRequest"
                :maxAge="learning.maxAge || 'N/A'"
                :minAge="learning.minAge || 'N/A'"
                :date="learning.date || 'N/A'"
                :userId="learning.userId ||''"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script lang="js" setup>
import { ref, onMounted, watch, computed } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import { useLearningsStore } from "../stores/learnings-store";
import LearningsPageDetailsCard from "../components/LearningsPageDetailsCard.vue";

const $q = useQuasar();
const router = useRouter();
const communityStore = useAuthCommunityStore();
const learningsStore = useLearningsStore();
const selectedCommunity = ref(null);
const isLoading = ref(true);
const tab = ref("offerings");

// Filter learning items into offerings and requests
const offerings = computed(() =>
  learningsStore.learningItems.filter((item) => !item.isRequest)
);
const requests = computed(() =>
  learningsStore.learningItems.filter((item) => item.isRequest)
);

// Fetch community options
const communityOptions = computed(() =>
  communityStore.communities.map((community) => ({
    label: community.name,
    value: community.id,
  }))
);

// Navigate to learning details
const goToLearningDetails = (learningId) => {
  router.push({ name: "learningDetails", params: { id: learningId } });
};

// Fetch learning items for the selected community
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

// Initialize and fetch learning items on mount
onMounted(async () => {
  if (communityStore.profile?.currentCommunityId) {
    selectedCommunity.value = communityStore.profile.currentCommunityId;
    await fetchLearningItems(selectedCommunity.value);
  }
});

// Watch for community changes
watch(selectedCommunity, async (newCommunity) => {
  if (newCommunity) {
    isLoading.value = true;
    await fetchLearningItems(newCommunity);
  }
});
</script>