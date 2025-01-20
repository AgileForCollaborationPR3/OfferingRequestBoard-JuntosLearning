<template>
  <div class="flex items-center">
    <!-- Avatar with initials or image -->
    <div :style="avatarStyle">
      <div v-if="avatarImageAvailable">
        <q-img :height="avatarSize" :width="avatarSize" :src="props.avatarSrc" :style="avatarStyle" />
      </div>
      <div v-else class="avatar__initials flex flex-center text-white" :style="avatarStyle">
        <span>{{ initials }}</span>
      </div>
    </div>

    <!-- Optional username chip -->
    <div>
      <div v-if="!showInitialsOnly" :class="['chip__username q-ml-xs', fontSize, bgColor, textColor]">
        {{ props.firstName + ' ' + props.lastName }} 
      </div>

      <!-- Edit button in edit mode -->
      <q-btn v-if="props.editMode" label="Edit" class="q-ml-sm q-pr-xs" color="accent" icon="edit" size="xs" dense
        outline @click="openDialog" />
    </div>

    <!-- Edit dialog -->
    <q-dialog v-model="isDialogOpen">
      <q-card>
        <q-card-section>
          <div class="text-h6">Edit Profile</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="firstNameState" label="First Name" outlined dense />
          <q-input v-model="lastNameState" label="Last Name" outlined dense class="q-mt-sm" />
          <q-uploader label="Upload Avatar" accept="image/jpeg, image/png" :multiple="false" v-model="avatarFile"
            @added="onFileAdded" class="q-mt-sm" color="white" text-color="primary" outlined
            style="max-width:310px;border:0.5px solid rgba(0, 0, 0, 0.87);" flat />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary-80" @click="closeDialog" />
          <q-btn label="Save" color="primary" @click="saveChanges" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useQuasar } from "quasar";
import { useAuthCommunityStore } from "../../stores/auth-community-store";

const props = defineProps({
  firstName: {
    type: String,
    default: "Unknown",
  },
  lastName: {
    type: String,
    default: "",
  },
  showInitialsOnly: {
    type: Boolean,
    default: false,
  },
  avatarSize: {
    type: [Number, String],
    default: 44,
  },
  avatarSrc: {
    type: String,
    default: "",
  },
  fontSize: {
    type: String,
    default: "text-caption",
  },
  bgColor: {
    type: String,
    default: "bg-accent",
  },
  textColor: {
    type: String,
    default: "text-primary",
  },
  editMode: {
    type: Boolean,
    default: false,
  },
  onlyShowFirstName: {
    type: Boolean,
    default: false
  }
});

const avatarImageAvailable = computed(() => !!props.avatarSrc);

const initials = computed(() => {
  const firstInitial = props.firstName?.charAt(0).toUpperCase() || "";
  const lastInitial = props.lastName?.charAt(0).toUpperCase() || "";
  return `${firstInitial}${lastInitial}`;
});

const avatarStyle = computed(() => ({
  height: `${props.avatarSize}px`,
  width: `${props.avatarSize}px`,
  fontSize: `${props.avatarSize / 2.5}px`,
  lineHeight: `${props.avatarSize}px`,
  borderRadius: `${props.avatarSize / 2.5}px`,
}));

// Dialog state
const isDialogOpen = ref(false);
const firstNameState = ref("");
const lastNameState = ref("");
const avatarFile = ref(null);

const $q = useQuasar();
const store = useAuthCommunityStore();

const openDialog = () => {
  firstNameState.value = props.firstName || "";
  lastNameState.value = props.lastName || "";
  isDialogOpen.value = true;
};

const closeDialog = () => {
  isDialogOpen.value = false;
};


// File validation function
const onFileAdded = (files) => {
  if (files && files.length > 0) {
    avatarFile.value = files; // Store the selected file
    console.log("File added:", avatarFile.value);
  } else {
    avatarFile.value = null; // Clear if no file is added
  }
};

/*
function validateFile(files) {
  const maxSize = 1 * 1024 * 1024; // 1 MB
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];


  // Process the first file only
  const file = files[0];
  if (file) {
    const isValidType = validTypes.includes(file.type);
    const isValidSize = file.size <= maxSize;

    if (isValidType && isValidSize) {
      return [file]; // Accept only the valid file
    }
  }

  return []; // Reject invalid file(s)
}

// Handle rejected files
function handleRejectedFiles(rejectedEntries) {
  $q.notify({
    type: "negative",
    message: `${rejectedEntries.length} file(s) did not meet the validation constraints.`,
  });
} */

const emit = defineEmits(["update"]);

const saveChanges = async () => {
  try {
    const updates = {
      firstName: firstNameState.value,
      lastName: lastNameState.value,
    };

    if (avatarFile.value && avatarFile.value[0]) {
      updates.avatarFile = avatarFile.value[0]; // Use the first file if available
    }

    await store.updateProfile(updates);

    // Emit updated fields to parent
    emit("update", updates);

    $q.notify({
      type: "positive",
      message: "Profile updated successfully!",
    });
    closeDialog();
  } catch (error) {
    console.error("Error saving changes:", error);
    $q.notify({
      type: "negative",
      message: error.message || "Failed to update profile. Please try again.",
    });
  }
};

</script>

<style scoped>
.avatar__initials {
  background-color: #3d140e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
}

.chip__username {
  border-radius: 5px;
  padding: 4px 8px;
  font-weight: 700;
}
</style>
