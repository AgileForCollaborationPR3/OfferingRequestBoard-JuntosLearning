<template>
  <div class="message-replies">
    <q-chat-message
      v-for="reply in replies"
      :key="reply.id"
      :name="reply.firstName + ' ' + reply.lastName"
      :avatar="reply.avatarUrl || defaultAvatar"
      :stamp="formatTimestamp(reply.createdAt)"
    >
      <p>{{ reply.message }}</p>
    </q-chat-message>
  </div>
</template>

<script setup>

defineProps({
  replies: {
    type: Array,
    required: true,
  },
});

const defaultAvatar = "https://via.placeholder.com/150";

function formatTimestamp(timestamp) {
  if (!timestamp) return "Invalid date";
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
</script>

<style scoped>
.message-replies {
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #ccc;
}
</style>
