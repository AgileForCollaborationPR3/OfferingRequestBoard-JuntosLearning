<script setup>
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute(); // Get the current route

defineOptions({
  name: 'MainLayout',
});
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-footer elevated>
      <q-toolbar class="bg-primary text-white justify-around q-pb-sm">
        <!-- Home Button -->
        <q-btn flat icon="o_groups" :color="route.path === '/people' ? 'white' : 'secondary'" size="md"
          @click="router.push('/people')" />

        <!-- Board Button -->
        <q-btn flat icon="o_search" :color="route.path === '/search' ? 'white' : 'secondary'" size="md"
          @click="router.push('/browselearnings')" />

        <!-- Add Entry Button -->
        <q-btn flat icon="o_playlist_add" :color="route.path === '/add' ? 'white' : 'secondary'" size="md"
          @click="router.push('/mylearnings')" />

        <!-- Info Button -->
        <q-btn flat icon="o_forum" :color="route.path === '/messages' ? 'white' : 'secondary'" size="md"
          @click="router.push('/messages')" />

        <!-- Profile Button -->
        <q-btn flat icon="o_person" :color="route.path === '/profile' ? 'white' : 'secondary'" size="md"
          @click="router.push('/profile')" />
      </q-toolbar>
    </q-footer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
