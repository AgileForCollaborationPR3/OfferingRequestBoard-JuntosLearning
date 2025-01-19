<template>
  <q-card class="bg-white q-mb-md" style="border-radius: 10px;">
    <!-- First Card Section -->
    <q-card-section class="q-px-md q-py-sm">
      <div class="row items-center">
        <div class="col">
          <div class="text-body1 text-primary">
            {{ isRequest ? 'I WANT TO LEARN' : 'LEARN' }}
          </div>
          <div class="lora text-h5 text-primary">
            {{ title }}
          </div>
        </div>
        <div class="col-auto">
          <q-avatar size="32px" :src="avatarUrl" />
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
import { defineProps } from 'vue';
import LearningChipsDetails from './commons/LearningChipsDetails.vue';

// Props to receive necessary data for the card
defineProps({
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
});

</script>

<style scoped></style>
