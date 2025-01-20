<template>
  <q-card class="bg-white q-mb-md" style="border-radius: 10px;">
    <!-- First Card Section -->
    <q-card-section class="q-px-md q-py-sm">
      <div class="row items-top">
        <div class="col">
          <div class="text-caption text-weight-bold text-primary-80">
            {{ isRequest ? 'I want to learn ...' : 'Learn ...' }}
          </div>
          <div class="lora text-h5 text-primary">
            {{ title }}
          </div>
        </div>
        <div class="col-auto">
          <UserProfileAvatar :firstName="firstNameTem" :lastName="lastNameTem" :avatarSrc="avatarUrlTem"
            :showInitialsOnly="true" :onlyShowFirstName="true" avatarSize="24" fontSize="text-body2" bgColor="bg-white"
            textColor="text-primary" />
        </div>
      </div>
    </q-card-section>

    <!-- Second Card Section -->
    <q-card-section class="q-px-md q-py-sm">
      <LearningChipsDetails :formats="formats" :location="location" :date="date" :min-age="minAge" :max-age="maxAge" />
    </q-card-section>

    <q-separator />

    <!-- Third Card Section -->
    <q-card-section class="q-px-md q-py-sm">
      <div class="row items-center">
        <div class="col">
          <q-chip :label="stage" color="primary" text-color="white" class="q-mr-sm" />
        </div>
        <div class="col-auto text-body2 text-primary">
          {{ offers }} offers, {{ requests }} requests
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import { useProfileStore } from '../stores/profile-store';
import LearningChipsDetails from './commons/LearningChipsDetails.vue';
import UserProfileAvatar from './commons/userProfileAvatar.vue';

// Props to receive necessary data for the card
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    required: true,
  },
  formats: {
    type: Array,
    default: () => [],
  },
  stage: {
    type: String,
    required: true,
  },
  offers: {
    type: Number,
    required: true,
  },
  requests: {
    type: Number,
    required: true,
  },
  isRequest: {
    type: Boolean,
    required: true,
  },
  location: {
    type: String,
    default: 'flexible',
  },
  maxAge: {
    type: Number,
    default: 0,
  },
  minAge: {
    type: Number,
    default: 2,
  },
  date: {
    type: String,
    default: '',
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    default: ''
  }
});

// Profile data state
const firstNameTem = ref('');
const lastNameTem = ref('');
const avatarUrlTem = ref('');

// Fetch user profile using the userId
const profileStore = useProfileStore();

const fetchUserProfile = async () => {
  try {
    const profile = await profileStore.fetchProfile(props.userId);
    if (profile) {
      firstNameTem.value = profile.firstName || 'User';
      lastNameTem.value = profile.lastName || '';
      avatarUrlTem.value = profile.avatarUrl || '';
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error.message);
  }
};

// Fetch profile on component mount
onMounted(() => {
  if (props.userId) fetchUserProfile();
});

</script>

<style scoped></style>
