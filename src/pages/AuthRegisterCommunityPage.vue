<template>
  <q-page class="bg-lpage q-pa-sm">
    <div class="bg-accent q-py-md" style="border-radius:20px">
      <div class="row justify-center">
        <div class="col-auto q-py-sm q-px-md lora text-h6 text-primary text-weight-bold">
          {{ isCreatingCommunity ? 'Set Up Your Community' : 'Join Your Community' }}
        </div>
        <div class="col-auto text-center q-px-md q-pb-lg nunito text-body2 text-primary">
          {{ isCreatingCommunity
            ? 'Name your community – the space where members connect, share, and shape its culture with intention.'
            : 'Enter the Community ID provided by the community leader to join.' }}
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-11">
          <q-form @submit.prevent="handleSubmit">
            <!-- Community Name Input -->
            <q-input flat v-if="isCreatingCommunity" v-model="formData.communityName" color="primary"
              label-color="primary" label="Community Name" :rules="[val => !!val || 'Community name is required.']" />

            <!-- Community ID Input -->
            <q-input v-else v-model="formData.juntosLivingCommunityId" color="primary" label="Community ID"
              label-color="primary" hint="Example: LyceumApolloClass25-a3b4"
              :rules="[val => !!val || 'Community ID is required.']">
              <template v-slot:append>
                <q-icon name="help_outline" size="xs" class="cursor-pointer text-primary" color="grey-6"
                  @click="showHelpDialog = true">
                  <q-tooltip>
                    Ask your community leader for the ID to join an existing community.
                  </q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <!-- Submit Button -->
            <q-btn rounded class="full-width q-mt-xl"
              :label="isCreatingCommunity ? 'Create Community' : 'Join Community'" color="primary" no-caps
              :disable="isCreatingCommunity ? !formData.communityName : !formData.juntosLivingCommunityId"
              @click="handleSubmit" />

            <!-- Toggle Button -->
            <q-btn rounded outline class="full-width q-my-md"
              :label="isCreatingCommunity ? 'Join Existing Community' : 'Create New Community'" color="primary" no-caps
              @click="toggleCommunityAction" />
          </q-form>
        </div>
      </div>
    </div>

    <watermark />

    <!-- Help Dialog -->
    <q-dialog v-model="showHelpDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="help_outline" size="lg" class="text-primary q-mr-md" />
          <div class="text-h6">What is a Community ID?</div>
        </q-card-section>
        <q-card-section>
          A Community ID is a unique identifier for your community. Ask your community leader for the ID to join an
          existing
          community.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" @click="showHelpDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import watermark from 'src/components/commons/LogoWatermark.vue';

// Initialize store, router, and Quasar for notifications
const authCommunityStore = useAuthCommunityStore();
const router = useRouter();
const $q = useQuasar();

// Form data and state
const formData = ref({
  communityName: "",
  juntosLivingCommunityId: "",
});
const isCreatingCommunity = ref(true);
const showHelpDialog = ref(false);

// Toggle between creating and joining community
const toggleCommunityAction = () => {
  isCreatingCommunity.value = !isCreatingCommunity.value;
  formData.value.communityName = "";
  formData.value.juntosLivingCommunityId = "";
};

// Handle form submission
const handleSubmit = async () => {
  try {
    if (isCreatingCommunity.value) {
      // Validate and create the community
      await authCommunityStore.createCommunity(formData.value.communityName);
      $q.notify({ type: "positive", message: "Community created successfully!", position: "top" });
    } else {
      // Join an existing community
      await authCommunityStore.joinCommunity(formData.value.juntosLivingCommunityId);
      $q.notify({ type: "positive", message: "Joined community successfully!", position: "top" });
    }

    // Navigate to the people page
    router.push("/people");
  } catch (error) {
    console.error("Community setup error:", error.message);
    $q.notify({ type: "negative", message: error.message || "An error occurred.", position: "top" });
  }
};
</script>
