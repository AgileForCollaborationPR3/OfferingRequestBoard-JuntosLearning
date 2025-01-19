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
    /** Fetch Profile **/
    async fetchProfile(userId) {
      try {
        if (this.publicProfiles[userId]) {
          return this.publicProfiles[userId]; // Return cached profile
        }

        const profileDoc = await getDoc(doc(db, "profiles", userId));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          this.publicProfiles[userId] = profileData; // Cache the profile
          return profileData;
        } else {
          console.warn("Profile not found for user:", userId);
          return null;
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

    /** Update Profile Fields **/
    async updateProfileFields(updates) {
      try {
        const userId = this.profile?.userId;
        if (!userId) throw new Error("User not logged in.");

        updates.updatedAt = new Date().toISOString();
        await updateDoc(doc(db, "profiles", userId), updates);

        this.profile = { ...this.profile, ...updates };
      } catch (error) {
        console.error("Error updating profile:", error.message);
        throw new Error("Failed to update profile.");
      }
    },
  },
});
