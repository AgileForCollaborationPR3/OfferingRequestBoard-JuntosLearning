<template>
  <q-page class="bg-lpage">
    <q-page-sticky position="top-left" :offset="[0, 0]" style="z-index: 3" class="bg-lpage full-width">
      <q-toolbar class="text-primary" :style="{ width: $q.screen.width + 'px' }">
        <q-btn class="absolute" flat round text-color="primary" dense icon="o_arrow_back" @click="router.back()" />
        <q-toolbar-title class="lora text-h6 text-weight-bold text-primary text-center">
          Member Details
        </q-toolbar-title>
      </q-toolbar>
    </q-page-sticky>
    <div class="bg-lpage q-mt-md" :style="{ paddingTop: '50px' }">
      <!-- Loading Indicator -->
      <div v-if="loading" class="q-pa-lg q-px-md">
        <q-spinner size="50px" color="primary" />
        <div class="text-body1 q-mt-md text-primary">Loading user data...</div>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="q-pa-lg text-negative q-px-md">
        <q-icon name="error" size="lg" />
        <div class="text-body1 q-mt-md">{{ error }}</div>
      </div>

      <!-- User Data -->
      <div v-if="userData">
        <div class="flex flex-center q-px-md">
          <div class="user-card flex-column align-center">
            <!-- Avatar with initials or image -->
            <div :style="avatarStyle" class="avatar-container">
              <div v-if="userData.avatarUrl">
                <q-img :src="userData.avatarUrl" class="avatar-style" />
              </div>
              <div v-else class="avatar__initials flex flex-center text-white avatar-style">
                <span>{{ initials }}</span>
              </div>
            </div>
            <div class="text-primary text-h5 q-pt-sm text-weight-bold">
              {{ userData.firstName + ' ' + userData.lastName }}
            </div>
            <div class="text-primary text-caption">Member since {{ formattedDate }}</div>
          </div>
        </div>

        <div class="q-pt-lg q-px-md">
          <q-list>
            <q-item dense class="q-px-none q-py-md">
              <q-item-section avatar top>
                <q-icon color="primary" name="o_business_center" />
              </q-item-section>

              <q-item-section class="q-pa-none">
                <q-item-label class="text-body2 text-primary">{{ userData.work || "Not specified" }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item dense class="q-pa-none">
              <q-item-section avatar top>
                <q-icon color="primary" name="o_interests" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body2 text-primary">{{ userData.interests || "Not specified" }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
        <div class="q-pt-lg q-px-md">
          <div class="text-body2 text-primary text-weight-bold">About</div>
          <div class="text-body2 text-primary">{{ userData.about }}</div>
        </div>
        <div class="q-pt-lg q-px-md">
          <q-btn label="Send a Message" class="full-width" color="primary" text-color="lpage" no-caps rounded></q-btn>
        </div>

        <div class="q-pt-lg">
          <div class="q-gutter-y-md" style="max-width: 600px">
            <q-card>
              <q-tabs v-model="tab" dense class="text-grey" active-color="primary" indicator-color="primary">
                <q-tab name="offerings" label="Learning Offerings" no-caps />
                <q-tab name="requests" label="Learning Requests" no-caps />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated>
                <!-- Offerings Tab -->
                <q-tab-panel name="offerings">
                  <div v-for="(stageItems, stage) in offeringStages" :key="stage" class="q-pb-md">
                    <div class="text-h6 text-primary">{{ stage }}</div>
                    <div v-if="stageItems.length" class="row no-wrap q-pt-xs">
                      <LearningCardMini v-for="item in stageItems" :key="item.id" :title="item.title"
                        :isRequest="item.isRequest" :stage="item.stage" :location="item.location"
                        :formats="item.formats" :minAge="item.minAge" :maxAge="item.maxAge" class="q-mx-xs" />
                    </div>
                    <div v-else class="text-body2 text-primary-80">No {{ stage.toLowerCase() }} yet.</div>
                  </div>
                </q-tab-panel>

                <!-- Requests Tab -->
                <q-tab-panel name="requests">
                  <div v-for="(stageItems, stage) in requestStages" :key="stage" class="q-pb-md">
                    <div class="text-h6 text-primary">{{ stage }}</div>
                    <div v-if="stageItems.length" class="row no-wrap q-pt-xs">
                      <LearningCardMini v-for="item in stageItems" :key="item.id" :title="item.title"
                        :isRequest="item.isRequest" :stage="item.stage" :location="item.location"
                        :formats="item.formats" :minAge="item.minAge" :maxAge="item.maxAge" class="q-mx-xs" />
                    </div>
                    <div v-else class="text-body2 text-primary-80">No {{ stage.toLowerCase() }} yet.</div>
                  </div>
                </q-tab-panel>

              </q-tab-panels>
              <q-separator />
            </q-card>
          </div>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProfileStore } from "../stores/profile-store";
import { useLearningsStore } from "../stores/learnings-store";
import { useQuasar } from "quasar";
import LearningCardMini from "../components/PeoplePageDetailsLearningCardMini.vue"

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const profileStore = useProfileStore();
const learningsStore = useLearningsStore();

const userId = ref(route.params.id); // Extract user ID from the route
const userData = ref(null); // Store user data
const loading = ref(true); // Loading state
const error = ref(null); // Error state
const tab = ref('offerings');

// get initials for default avatar
const initials = computed(() => {
  const firstInitial = userData.value.firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = userData.value.lastName?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
});


// Computed property to format the date string
const formattedDate = computed(() => {
  if (!userData.value.createdAt) return '';
  console.log(userData.value.createdAt)

  const date = new Date(userData.value.createdAt);

  if (isNaN(date)) return 'Invalid date';

  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
});

/**
// Horizontal scroll area style for filter
const thumbStyle = ref({
  width: "0px",
  opacity: 0,
});

const barStyle = ref({
  width: "0px",
  opacity: 0,
});



// All Available For Options
const availableOptions = [
  { text: "Company Tour", icon: "o_tour" },
  { text: "Expert Advice", icon: "o_verified" },
  { text: "Guest Lesson", icon: "o_school" },
  { text: "Hands-On Workshop", icon: "o_build" },
  { text: "Job Shadowing", icon: "o_visibility" },
  { text: "Lesson Series", icon: "o_library_books" },
  { text: "Mentoring/Coaching", icon: "o_supervisor_account" },
  { text: "Online Lesson", icon: "o_cast_for_education" },
  { text: "Q&A", icon: "o_contact_support" },
].sort((a, b) => a.text.localeCompare(b.text));


// Match the options from the server with the available options
const matchedAvailableForOptions = computed(() =>
  availableOptions.filter(option => userData.value.availableFor.includes(option.text))
);


// Define the order of days
const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


// Sort and prepare the availability data
const sortedAvailability = computed(() =>
  userData.value.availability
    .slice()
    .sort((a, b) => {
      // Sort by day based on the dayOrder array
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;

      // If the day is the same, sort by the starting time
      return a.from.localeCompare(b.from);
    })
);**/

// Group learning items by stage for offerings
const offeringStages = computed(() => {
  const items = learningsStore.learningItems.filter(
    (item) => item.userId === userId.value && !item.isRequest
  );
  return {
    Posted: items.filter((item) => item.stage === "posted"),
    Scheduled: items.filter((item) => item.stage === "scheduled"),
    Completed: items.filter((item) => item.stage === "completed"),
  };
});

// Group learning items by stage for requests
const requestStages = computed(() => {
  const items = learningsStore.learningItems.filter(
    (item) => item.userId === userId.value && item.isRequest
  );
  return {
    Posted: items.filter((item) => item.stage === "posted"),
    Scheduled: items.filter((item) => item.stage === "scheduled"),
    Completed: items.filter((item) => item.stage === "completed"),
  };
});

// Fetch user data and learning items
const fetchUserData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch profile
    const profile = await profileStore.fetchProfile(userId.value);
    userData.value = profile || null;

    // Fetch learning items (no communityId needed as it defaults in the store)
    await learningsStore.fetchLearningItems();

    loading.value = false;
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    error.value = "Failed to load user data.";
  }
};

// Watch route ID changes to reload user data
watch(() => route.params.id, (newId) => {
  userId.value = newId;
  fetchUserData();
});

// Fetch user data on mount
onMounted(fetchUserData);
</script>




<style scoped>
.user-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 63px;
  height: 63px;
  border-radius: 40%;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.avatar-style {
  height: 63px;
  width: 63px;
  font-size: 25px;
  line-height: 63px;
  border-radius: 40%;
}

.avatar__initials {
  background-color: #3d140e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 25px;
  color: white;
}

.q-item .q-item__section--avatar {
  min-width: 0px !important;
  padding-right: 10px;
}


.availability-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.availability-block {
  min-width: 105px;
  padding: 0px;
}
</style>
