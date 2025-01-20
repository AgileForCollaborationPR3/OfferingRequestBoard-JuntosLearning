<template>
  <q-page class="bg-lpage q-px-sm">
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
          <q-select dense rounded standout v-model="selectedCommunity" :options="communityStore.communities.map((community) => ({
            label: community.name,
            value: community.id,
          }))" label="Select Community" color="white" label-color="primary" bg-color="white" />
        </div>
        <div class="col-2 q-pl-sm">
          <q-btn label="filter" icon="o_filter_list" color="primary" size="sm" flat no-caps rounded dense></q-btn>

        </div>
        <div class="col-2">
          <q-btn label="sort" icon="o_sort" color="primary" size="sm" flat no-caps rounded dense></q-btn>
        </div>
      </div>
    </q-page-sticky>
    <div class="bg-lpage q-mt-md q-pb-md" :style="{ paddingTop: '78px' }">
      <div class="text-center q-pt-sm text-caption text-primary-50">{{ communityStore.communityMembers.length }} MEMBERS
      </div>
      <div v-if="communityStore.communityMembers.length">
        <PeoplePageCard v-for="member in communityStore.communityMembers" :key="member.id" :firstName="member.firstName"
          :lastName="member.lastName" :about="member.about" :interests="member.interests" :work="member.work"
          :avatarUrl="member.avatarUrl" :userId="member.userId" @click="router.push(`/user/${member.userId}`)" />
      </div>
      <div v-else class="text-body1 text-center text-primary-80 q-my-md">
        No members found for the selected community.
      </div>
    </div>
  </q-page>
</template>

<script lang="js" setup>
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import PeoplePageCard from "../components/PeoplePageCard.vue"
import { ref, watch, onMounted } from "vue";
import { useAuthCommunityStore } from "../stores/auth-community-store";
const router = useRouter();
const $q = useQuasar();

onMounted(async () => {
  if (communityStore.profile?.currentCommunityId) {
    selectedCommunity.value = communityStore.profile.currentCommunityId;
    await fetchCommunityMembers(selectedCommunity.value);
  }
});

const communityStore = useAuthCommunityStore();
const selectedCommunity = ref(null);

// Load community members when a community is selected
watch(selectedCommunity, async (newCommunity) => {
  if (newCommunity) {
    await fetchCommunityMembers(newCommunity);
  }
});

const fetchCommunityMembers = async (communityId) => {
  try {
    await communityStore.fetchCommunityMembers(communityId);
  } catch (error) {
    console.error("Failed to fetch community members:", error);
  }
};



</script>

<style></style>
