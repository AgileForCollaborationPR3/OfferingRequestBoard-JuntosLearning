<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuthCommunityStore } from "src/stores/auth-community-store";
import Watermark from "./components/commons/LogoWatermark.vue";

const authCommunityStore = useAuthCommunityStore();
const isMobile = ref(true); // Tracks whether the user is on a mobile device

// Check if the screen is mobile-sized
const checkScreenSize = () => {
  isMobile.value = window.matchMedia("(max-width: 768px)").matches; // Adjust 768px as needed for your mobile threshold
};

onMounted(async () => {
  try {
    // Initialize session and track authentication state
    await authCommunityStore.getSession();
    authCommunityStore.trackAuthChanges();

    // Check screen size on load
    checkScreenSize();

    // Listen for window resize events
    window.addEventListener("resize", checkScreenSize);
  } catch (error) {
    console.error("Error during app initialization:", error.message);
  }
});

watch(isMobile, (newValue) => {
  if (!newValue) {
    console.warn("Non-mobile screen detected!");
  }
});

const openLink = () => {
  window.open("https://www.agileforcollaboration.eu/", "_blank");
};

// Clean up event listener when the component is unmounted
onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<template>
  <div>
    <!-- Friendly message for non-mobile devices -->
    <div v-if="!isMobile" class="row non-mobile-message">
      <div class="col-12">
        <Watermark tagline="true" />
      </div>
      <div class=" col-12 text-primary nunito">
        This app is optimized for mobile devices. Please switch to a smaller screen for the best experience.
      </div>
      <div class="col12">
        <q-btn label="Visit our Agile 4 Collaboration Project Website" no-caps color="primary" rounded
          @click="openLink"></q-btn>
      </div>
    </div>

    <!-- Render app content for mobile -->
    <div v-else>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.non-mobile-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
  color: #333;
  font-size: 1.2rem;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}
</style>
