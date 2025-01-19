import { doc, setDoc } from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { db } from "../boot/firebase";

const auth = getAuth();

export const register = async (formData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    const user = userCredential.user;

    // Update user profile with display name
    await updateProfile(user, {
      displayName: `${formData.firstName} ${formData.lastName}`,
    });

    // Define timestamps
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    // Create initial profile in Firestore
    const profileData = {
      userId: user.uid,
      username: formData.username,
      fullName: `${formData.firstName} ${formData.lastName}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: "member", // Default role
      communityIds: [], // Empty array, updated by store
      isVerified: false,
      work: "Not specified",
      about: "Not specified",
      interests: "Not specified",
      availableFor: [],
      availability: [],
      location: "Not specified",
      avatarUrl: "", // Default avatar URL
      language: [],
      createdAt,
      updatedAt,
    };

    // Save to `profiles` collection
    await setDoc(doc(db, "profiles", user.uid), profileData);

    return user;
  } catch (error) {
    console.error("Registration error:", error.message);
    throw new Error(error.message || "Unable to register. Please try again.");
  }
};

export const login = async (formData) => {
  try {
    await signInWithEmailAndPassword(auth, formData.email, formData.password);
    return null; // Successful login
  } catch (error) {
    const errorMessage = mapFirebaseErrorToMessage(error.code);
    console.error("Login error:", error.message);
    throw new Error(errorMessage);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.message);
    throw new Error("Unable to logout. Please try again.");
  }
};

const mapFirebaseErrorToMessage = (errorCode) => {
  const errorMessages = {
    "auth/user-not-found": "User not found. Please check your email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests":
      "Too many failed login attempts. Please try again later.",
  };
  return (
    errorMessages[errorCode] ||
    "An unexpected error occurred. Please try again."
  );
};
