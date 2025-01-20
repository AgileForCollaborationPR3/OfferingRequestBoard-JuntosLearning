<template>
  <div class="row wrap">
    <!-- Display Formats -->
    <q-chip v-for="(chip, index) in formats" :key="index" :label="chip.text" :icon="chip.icon" class="q-mx-xs q-my-xs"
      color="accent" text-color="primary" size="sm" />

    <!-- Display Location if necessary -->
    <q-chip v-if="shouldShowLocation" :label="location" class="q-mx-xs q-my-xs" icon="location_on" color="accent"
      text-color="primary" size="sm" />

    <!-- Display Formatted Date -->
    <q-chip v-if="formattedDate" :label="formattedDate" class="q-mx-xs q-my-xs" icon="event" color="accent"
      text-color="primary" size="sm" />

    <!-- Display Age Range -->
    <q-chip v-if="age" :label="age" class="q-mx-xs q-my-xs" icon="cake" color="accent" text-color="primary" size="sm" />
  </div>
</template>

<script setup>
import { computed, defineProps } from 'vue';
import { formatDateShort } from '../../utils/formatDate';

// Define Props
const props = defineProps({
  formats: {
    type: Array,
    required: true,
    default: () => [],
  },
  location: {
    type: String,
    required: false,
    default: '',
  },
  date: {
    type: String,
    required: false,
    default: '',
  },
  minAge: {
    type: Number,
    required: true,
    default: 0,
  },
  maxAge: {
    type: Number,
    required: true,
    default: 0,
  },
});

// Computed Property: Age Range
const age = computed(() => {
  if (!props.minAge || !props.maxAge) return null;
  return `${props.minAge} - ${props.maxAge}`;
});

// Computed Property: Show Location Chip
const shouldShowLocation = computed(() => {
  return !props.formats.some((format) => format.text === 'Online Lesson');
});

// Computed Property: Formatted Date
const formattedDate = computed(() => {
  if (!props.date || props.date.toLowerCase() === 'flexible') {
    return null;
  }
  return formatDateShort(props.date);
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
