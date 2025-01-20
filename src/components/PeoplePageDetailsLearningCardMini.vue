<template>
  <q-card class="bg-accent" style="border-radius:10px; width:190px;height:105px;">
    <!-- Card Title -->
    <q-card-section class="learning-card-text q-px-sm q-py-none q-pt-xs">
      <div class="row justify-around items-center">
        <div class="col text-primary text-weight-bold text-caption">
          {{ isRequest ? 'I want to learn ...' : 'Learn ...' }}
        </div>
      </div>
    </q-card-section>

    <!-- Card Subtitle (Title) -->
    <q-card-section class="learning-card-text q-px-sm q-py-none lora text-primary">
      {{ title }}
    </q-card-section>

    <q-separator class="q-my-xs q-mx-xs" />

    <!-- Learning Chips Details -->
    <q-card-section class="q-px-sm q-py-none overflow-hidden">
      <LearningChipsDetails :formats="formats" :location="location" :date="date" :minAge="minAge" :maxAge="maxAge"
        class="overflow-hidden" />
    </q-card-section>
  </q-card>
</template>

<script lang="js" setup>
import LearningChipsDetails from './commons/LearningChipsDetails.vue';

defineProps({
  title: {
    type: String,
    required: true,
  },
  isRequest: {
    type: Boolean,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: false,
  },
  formats: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: false,
  },
  minAge: {
    type: Number,
    required: true,
  },
  maxAge: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.learning-card-text {
  font-size: 14px;
  line-height: 1;
}

.learning-card-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 2px;
  border-radius: 10px;
  font-size: 8px;
  font-weight: 500;
  line-height: 1;
}

.learning-card-chip-icon {
  margin-right: 4px;
  font-size: 10px;
  line-height: 1;
}

.learning-card-chip-tex {
  white-space: nowrap;
}
</style>
