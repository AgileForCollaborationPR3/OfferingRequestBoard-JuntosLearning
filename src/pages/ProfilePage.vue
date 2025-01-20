<template>
  <q-page class="bg-primary">
    <!-- Header Section -->
    <q-page-sticky position="top-left" :offset="[0, 0]" class="bg-primary full-width">
      <q-toolbar class="text-primary" :style="{ width: $q.screen.width + 'px' }">
        <q-toolbar-title class="lora text-h6 text-weight-bold text-primary">
          Profile
        </q-toolbar-title>
        <q-btn flat round text-color="primary" dense icon="o_notifications" />
      </q-toolbar>

      <div class="row items-center justify-center q-pb-xl">
        <div class="col-12 q-pl-md">
          <UserProfileAvatar :firstName="profile?.firstName || 'User'" :lastName="profile?.lastName || 'Name'"
            :avatarSrc="profile?.avatarUrl || ''" :showInitialsOnly="false" avatarSize="42" fontSize="text-h6"
            bgColor="bg-primary" textColor="text-lpage" :editMode="true" @update="onProfileUpdate" />
        </div>
      </div>
    </q-page-sticky>

    <!-- Profile Details Section -->
    <div class="bg-primary" :style="{ paddingTop: '150px' }">
      <div class="bg-lpage q-pa-md" :style="{ borderRadius: '20px 20px 0px 0px', minHeight: 'calc(100vh - 200px)' }">
        <div class="text-overline text-primary-80">PERSONAL DETAILS</div>
        <div class="q-pb-md">
          <q-list>
            <!-- Work -->
            <template v-if="!editMode.work">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_business_center" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">My Work</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.work || 'Not specified' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('work')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit My Work</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Please provide detailed information about your current role and responsibilities.
                </div>
                <q-input v-model="workInput" label="Your Work" outlined dense />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('work')" />
              </div>
            </template>

            <!-- Interests -->
            <template v-if="!editMode.interests">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_interests" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">My Interests & Hobbies</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.interests || 'Not specified' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('interests')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit My Interests & Hobbies</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Share your hobbies and activities you enjoy in your free time.
                </div>
                <q-input v-model="interestsInput" label="Your Interests" outlined dense type="textarea" />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('interests')" />
              </div>
            </template>

            <!-- About -->
            <template v-if="!editMode.about">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_person" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">About</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.about || 'No information provided' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('about')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit About</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Provide a short description about yourself (max 280 characters).
                </div>
                <q-input v-model="aboutInput" label="About You" outlined dense maxlength="280" counter
                  type="textarea" />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('about')" />
              </div>
            </template>

            <!-- Available For -->
            <template v-if="!editMode.availableFor">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_help" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">Available For</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.availableFor?.join(', ') || 'Not specified' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('availableFor')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit Available</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Select the types of learning offerings you can share.
                </div>
                <q-chip v-for="option in availableOptions" :key="option.text" :label="option.text" :icon="option.icon"
                  @click="toggleChip(option.text)" clickable
                  :text-color="availableForInput.includes(option.text) ? 'white' : ''"
                  :color="availableForInput.includes(option.text) ? 'primary' : 'accent'" dense />
                <div>
                  <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('availableFor')" />
                </div>
              </div>
            </template>

            <!-- Availability -->
            <template v-if="!editMode.availability">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_schedule" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">Availability</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.availability?.length
                      ? profile.availability.map(slot => `${slot.day}: ${slot.from} - ${slot.to}`).join(', ')
                      : 'No availability shared' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('availability')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit Availability</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Select days and timeslots you are available. You can add multiple slots.
                </div>

                <!-- Editable Slots -->
                <div v-for="(slot, index) in availabilityInput" :key="index" class="row items-center q-mb-sm">
                  <div class="col-12">
                    <div class="row items-center">
                      <div class="col-4">
                        <q-select v-model="slot.day" :options="dayOptions" label="Day" outlined dense />
                      </div>
                      <div class="col-3">
                        <q-input v-model="slot.from" label="From" outlined dense type="time" />
                      </div>
                      <div class="col-3">
                        <q-input v-model="slot.to" label="To" outlined dense type="time" />
                      </div>
                      <div class="col-2 flex items-center justify-center">
                        <q-btn flat round icon="o_delete" color="negative" size="sm" @click="removeSlot(index)" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add Slot Button -->
                <q-btn flat icon="add" color="primary" label="Add Slot" class="q-mt-sm" @click="addSlot" />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('availability')" />
              </div>
            </template>

            <!-- Language -->
            <template v-if="!editMode.language">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_language" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">Language</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.language?.length
                      ? profile.language.join(', ')
                      : 'No languages shared' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('language')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit Language</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Select the languages you speak.
                </div>
                <q-select v-model="languageInput" :options="languageOptions" label="Languages" outlined dense multiple
                  use-chips clearable />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('language')" />
              </div>
            </template>



            <!-- Location -->
            <template v-if="!editMode.location">
              <q-item clickable>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_location_on" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-body2 text-primary">Location</q-item-label>
                  <q-item-label caption class="text-body2 text-primary-80">
                    {{ profile?.location || 'Not specified' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section avatar>
                  <q-icon color="primary" name="o_edit" @click="toggleEdit('location')" />
                </q-item-section>
              </q-item>
            </template>

            <template v-else>
              <div class="q-pa-md transition-expanded" style="background-color: white; border-radius: 10px;">
                <div class="text-body1 text-primary q-mb-sm">Edit Languages</div>
                <div class="text-caption text-primary-80 q-mb-md">
                  Select the languages you speak.
                </div>
                <q-input v-model="locationInput" label="City, Country" outlined dense />
                <q-btn class="q-mt-md" color="primary" label="Save and Continue" @click="saveEdit('location')" />
              </div>
            </template>
          </q-list>
        </div>
      </div>
    </div>
  </q-page>
</template>


<script lang="js" setup>
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import UserProfileAvatar from "../components/commons/UserProfileAvatar.vue";
import { useAuthCommunityStore } from "../stores/auth-community-store";
import { useProfileStore } from "../stores/profile-store";

const $q = useQuasar();
const authCommunityStore = useAuthCommunityStore();
const profileStore = useProfileStore();

const profile = ref(null);
const editMode = ref({
  work: false,
  interests: false,
  about: false,
  availableFor: false,
  availability: false,
  language: false,
  location: false,
});

const workInput = ref("");
const interestsInput = ref("");
const aboutInput = ref("");
const availableForInput = ref([]);
const availabilityInput = ref([]);
const languageInput = ref([]);
const locationInput = ref("");

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

const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const languageOptions = ["English", "Dutch", "French", "German", "Spanish"];

// Fetch profile data on mount
onMounted(async () => {
  try {
    await profileStore.fetchProfile(authCommunityStore.user?.uid);
    profile.value = profileStore.profile;

    // Initialize form fields with profile data
    workInput.value = profile.value?.work || "";
    interestsInput.value = profile.value?.interests || "";
    aboutInput.value = profile.value?.about || "";
    availableForInput.value = profile.value?.availableFor || [];
    availabilityInput.value = profile.value?.availability || [];
    languageInput.value = profile.value?.language || [];
    locationInput.value = profile.value?.location || "";
  } catch (error) {
    console.error("Error loading profile:", error.message);
    $q.notify({ type: "negative", message: "Failed to load profile data." });
  }
});

// Update User Avatar Profile Edit

function onProfileUpdate(updatedFields) {
  Object.assign(profile.value, updatedFields);
}

// Save updated field
async function saveEdit(field) {
  try {
    const updates = {};
    switch (field) {
      case "work":
        updates.work = workInput.value;
        break;
      case "interests":
        updates.interests = interestsInput.value;
        break;
      case "about":
        updates.about = aboutInput.value;
        break;
      case "availableFor":
        updates.availableFor = availableForInput.value;
        break;
      case "availability":
        updates.availability = availabilityInput.value;
        break;
      case "language":
        updates.language = languageInput.value;
        break;
      case "location":
        updates.location = locationInput.value;
        break;
    }

    await profileStore.updateProfileFields(updates);
    Object.assign(profile.value, updates);
    editMode.value[field] = false;

    $q.notify({ type: "positive", message: `${field} updated successfully!` });
  } catch (error) {
    console.error(`Error updating ${field}:`, error.message);
    $q.notify({ type: "negative", message: `Failed to update ${field}.` });
  }
}

function toggleEdit(field) {
  editMode.value[field] = true;
}

function toggleChip(option) {
  const index = availableForInput.value.indexOf(option);
  if (index >= 0) {
    availableForInput.value.splice(index, 1);
  } else {
    availableForInput.value.push(option);
  }
}

function addSlot() {
  availabilityInput.value.push({ day: "", from: "", to: "" });
}

function removeSlot(index) {
  availabilityInput.value.splice(index, 1);
}
</script>


<style scoped>
.transition-expanded {
  transition: all 0.3s ease-in-out;
}

.q-field--outlined .q-field__control {
  padding: 0px !important;
}
</style>
