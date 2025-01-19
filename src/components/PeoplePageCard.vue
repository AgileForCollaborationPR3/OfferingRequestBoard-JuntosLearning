<template>
  <q-card class="bg-white full-width q-mx-sm q-my-md" style="border-radius: 20px;">
    <q-card-section class="q-pb-sm">
      <UserProfileAvatar :firstName="firstName || 'User'" :lastName="lastName || 'Name'" :avatarSrc="avatarUrl || ''"
        :showInitialsOnly="false" avatarSize="42" fontSize="text-h6" bgColor="bg-white" textColor="text-primary"
        :editMode="false" />
    </q-card-section>
    <q-card-section class="q-pt-none">
      <q-list>
        <q-item dense class="q-pa-none">
          <q-item-section avatar>
            <q-icon color="primary" name="o_business_center" />
          </q-item-section>

          <q-item-section class="q-pa-none">
            <q-item-label class="text-body2 text-primary">{{ work || "Not specified" }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item dense class="q-pa-none">
          <q-item-section avatar>
            <q-icon color="primary" name="o_interests" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-body2 text-primary">{{ interests || "Not specified" }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script lang="js" setup>
import UserProfileAvatar from "./commons/userProfileAvatar.vue";

defineProps({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: false,
    default: "No description available.",
  },
  interests: {
    type: String,
    required: false,
    default: "No interests shared.",
  },
  work: {
    type: String,
    required: false,
    default: "No work information provided.",
  },
  avatarUrl: {
    type: String,
    required: false,
    default: "",
  },
  userId: {
    type: String,
    required: true,
  },
});

</script>

<style></style>
