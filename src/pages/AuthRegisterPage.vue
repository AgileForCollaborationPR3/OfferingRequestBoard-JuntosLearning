<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { register } from "../utils/firebaseAuth";

const $q = useQuasar();
const router = useRouter();

// Form data and loading state
const formData = ref({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const loading = ref(false);

const signup = async () => {
  try {
    // Validate inputs
    if (!formData.value.username || !formData.value.firstName || !formData.value.lastName) {
      $q.notify({ type: "negative", message: "All fields are required." });
      return;
    }
    if (formData.value.password !== formData.value.confirmPassword) {
      $q.notify({ type: "negative", message: "Passwords do not match." });
      return;
    }

    // Set loading state
    loading.value = true;

    // Attempt registration
    const isRegistered = await register(formData.value);

    if (isRegistered) {
      $q.notify({ type: "positive", message: "Registration successful!" });
      router.push("/community"); // Navigate to community setup
    } else {
      $q.notify({ type: "negative", message: "Registration failed. Try again." });
    }
  } catch (error) {
    console.error("Signup error:", error);
    $q.notify({ type: "negative", message: error.message || "An error occurred." });
  } finally {
    // Reset loading state
    loading.value = false;
  }
};
</script>

<template>
  <div class="q-pa-lg flex flex-center min-h-90vh bg-lpage">
    <q-card class="bg-accent q-py-lg" style="max-width: 400px; width: 100%; border-radius:40px;">
      <q-card-section>
        <div class="text-center">
          <div class="text-h5 lora text-primary text-weight-bold">Register</div>
          <div class="text-subtitle1 nunito text-primary">Create a new account</div>
        </div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <q-form @submit.prevent="signup">
          <!-- Form Fields -->
          <q-input v-model="formData.username" label="Username" placeholder="johndoe19" outlined dense class="q-mb-md"
            required />
          <div class="row q-col-gutter-sm q-mb-md">
            <q-input v-model="formData.firstName" label="First Name" placeholder="John" outlined dense class="col"
              required />
            <q-input v-model="formData.lastName" label="Last Name" placeholder="Doe" outlined dense class="col"
              required />
          </div>
          <q-input v-model="formData.email" type="email" label="Email" placeholder="johndoe19@example.com" outlined
            dense class="q-mb-md" required />
          <q-input v-model="formData.password" type="password" label="Password" placeholder="*****" outlined dense
            class="q-mb-md" required />
          <q-input v-model="formData.confirmPassword" type="password" label="Confirm Password" placeholder="*****"
            outlined dense class="q-mb-md" required />

          <!-- Submit Button -->
          <q-btn type="submit" :loading="loading" color="primary" class="full-width" :label="loading ? '' : 'Register'">
            <template v-if="loading" #loading>
              <q-spinner-dots size="md" color="white" />
            </template>
          </q-btn>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>
