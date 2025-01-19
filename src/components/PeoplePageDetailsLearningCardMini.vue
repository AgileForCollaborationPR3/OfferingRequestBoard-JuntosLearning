<template>
  <q-card class="bg-accent" style="border-radius:10px; width:170px;height:105px;">
    <q-card-section class="learning-card-text q-px-sm q-py-none">
      <div class="row justify-around items-center">
        <div class="col text-primary text-weight-bold">Learn ... </div>
        <div class="col text-right ">
          <q-chip class="q-px-xs q-mx-none" label="Back Soon" size="xs" color="implementing" text-color="primary" />
        </div>
      </div>
    </q-card-section>
    <q-card-section class="learning-card-text q-px-sm q-py-none lora text-primary">how to
      experience live
      on a Greek
      Island.</q-card-section>
    <q-separator class="q-my-xs q-mx-xs" />
    <q-card-section class="q-px-sm q-py-none">
      <div class="learning-card-chip text-primary bg-accent" v-for="option in availableOptions" :key="option.text">
        <i class="learning-card-chip-icon material-icons-outlined">{{ option.icon }}</i>
        <span class="learning-cardchip-text">{{ option.text }}</span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="js" setup>

// options chips
const availableOptions = [
  { text: "Guest Lesson", icon: "school" },
  { text: "Online", icon: "location_on" },
  { text: "Age: 10 - 12", icon: "cake" },
  { text: "Dutch", icon: "language" },
].sort((a, b) => a.text.localeCompare(b.text));

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
