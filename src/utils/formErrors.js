import { ref } from "vue";

export const useFormErrors = () => {
  const serverError = ref("");
  const realtimeErrors = ref({
    email: [],
    password: [],
  });

  const handleServerError = (error) => {
    serverError.value = error || "An unexpected error occurred.";
  };

  const handleLoginForm = (formData) => {
    serverError.value = ""; // Clear server error on new input
    realtimeErrors.value = {
      email: [],
      password: [],
    };

    if (!formData.email) {
      realtimeErrors.value.email.push("Email is required.");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      realtimeErrors.value.email.push("Invalid email format.");
    }

    if (!formData.password) {
      realtimeErrors.value.password.push("Password is required.");
    } else if (formData.password.length < 6) {
      realtimeErrors.value.password.push(
        "Password must be at least 6 characters."
      );
    }
  };

  return {
    serverError,
    handleServerError,
    realtimeErrors,
    handleLoginForm,
  };
};
