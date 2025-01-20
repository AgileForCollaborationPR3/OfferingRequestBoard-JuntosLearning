import { defineStore } from "pinia";
import { db } from "../boot/firebase";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  updateDoc,
} from "firebase/firestore";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    profile: null, // Current user's full profile
    publicProfiles: {}, // Cached public profiles for other users
  }),

  actions: {
    /** Fetch the user's profile **/
    async fetchProfile(userId) {
      try {
        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
          this.profile = profileDoc.data();
          return this.profile;
        } else {
          console.warn("Profile not found for user:", userId);
          this.profile = null;
        }
      } catch (error) {
        console.error("Error fetching profile:", error.message);
        throw new Error("Failed to fetch profile.");
      }
    },

    /** Fetch Multiple Profiles **/
    async fetchProfiles(userIds) {
      try {
        const missingUserIds = userIds.filter((id) => !this.publicProfiles[id]);

        if (missingUserIds.length === 0) {
          return userIds.map((id) => this.publicProfiles[id] || null);
        }

        const profilesQuery = query(
          collection(db, "profiles"),
          where("userId", "in", missingUserIds)
        );
        const snapshot = await getDocs(profilesQuery);

        snapshot.forEach((doc) => {
          const profileData = doc.data();
          this.publicProfiles[profileData.userId] = profileData; // Cache profiles
        });

        return userIds.map((id) => this.publicProfiles[id] || null);
      } catch (error) {
        console.error("Error fetching profiles:", error.message);
        throw new Error("Failed to fetch profiles.");
      }
    },

    /** Update specific fields in the user's profile **/
    async updateProfileFields(updates) {
      try {
        if (!this.profile?.userId) throw new Error("User is not logged in.");

        // Add updated timestamp
        updates.updatedAt = new Date().toISOString();

        // Update the profile document in Firestore
        await updateDoc(doc(db, "profiles", this.profile.userId), updates);

        // Update the local state
        this.profile = { ...this.profile, ...updates };
      } catch (error) {
        console.error("Error updating profile:", error.message);
        throw new Error("Failed to update profile.");
      }
    },
  },
});
