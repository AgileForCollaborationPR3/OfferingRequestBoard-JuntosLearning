import { defineStore } from "pinia";
import { auth, db } from "../boot/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  getDocs,
  query,
  collection,
  where,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";
import { LocalStorage } from "quasar";
import { login, logout } from "../utils/firebaseAuth";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useChatStore } from "../stores/chat-store";
import { useLearningsStore } from "./learnings-store";

export const useAuthCommunityStore = defineStore("auth-community-store", {
  state: () => ({
    user: null, // Current logged-in user
    profile: null, // User's profile, including communities
    communities: [], // List of communities the user belongs to
    currentCommunity: null, // Currently active community
    communityMembersCount: 0, // Number of members in the current community
    communityMembers: [], // List of community members
  }),

  actions: {
    /** Fetch Profile **/
    async fetchProfile(uid) {
      const profileDoc = await getDoc(doc(db, "profiles", uid));

      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        this.profile = {
          ...profileData,
          communityIds: profileData.communityIds || [],
          currentCommunityId: profileData.currentCommunityId || null,
        };

        await this.fetchCommunities();

        if (this.profile.currentCommunityId) {
          await this.fetchCommunityMembersCount(
            this.profile.currentCommunityId
          );
        }
      } else {
        console.warn("Profile not found for user:", uid);
        this.profile = null;
        this.communities = [];
      }
    },

    /** Update Profile Avatar **/
    async updateAvatar(file) {
      try {
        const storage = getStorage();
        const avatarRef = storageRef(storage, `avatars/${this.user.uid}`);
        const snapshot = await uploadBytes(avatarRef, file);
        const avatarUrl = await getDownloadURL(snapshot.ref);

        await updateDoc(doc(db, "profiles", this.user.uid), {
          avatarUrl,
          updatedAt: new Date().toISOString(),
        });

        this.profile.avatarUrl = avatarUrl;
      } catch (error) {
        console.error("Error updating avatar:", error.message);
        throw new Error("Failed to update avatar.");
      }
    },

    /** Fetch Community Members Count **/
    async fetchCommunityMembersCount(communityId) {
      try {
        if (!communityId) {
          throw new Error("Community ID is required to fetch members count.");
        }

        const membersQuery = query(
          collection(db, "profiles"),
          where("communityIds", "array-contains", communityId)
        );

        const snapshot = await getDocs(membersQuery);
        this.communityMembersCount = snapshot.size;
      } catch (error) {
        console.error("Error fetching community members count:", error.message);
        this.communityMembersCount = 0;
      }
    },

    /** Fetch Community Members **/

    async fetchCommunityMembers(communityId) {
      try {
        const membersQuery = query(
          collection(db, "profiles"),
          where("communityIds", "array-contains", communityId)
        );
        const snapshot = await getDocs(membersQuery);
        this.communityMembers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return this.communityMembers;
      } catch (error) {
        console.error("Error fetching community members:", error.message);
        throw new Error("Failed to fetch community members.");
      }
    },

    /** Set Authentication **/
    async setAuth(user) {
      try {
        if (user) {
          this.user = user;
          await this.trackProfileChanges(user.uid);
          await this.fetchProfile(user.uid);

          // Fetch communities after profile is fetched
          if (this.profile) {
            await this.fetchCommunities();
          }

          // Check if the user has an active community
          if (!this.profile?.currentCommunityId) {
            console.warn(
              "No active community found. Redirecting to community setup."
            );
          }
        } else {
          this.user = null;
          this.profile = null;
          this.communities = [];
        }
      } catch (error) {
        console.error("Error setting auth:", error.message);
        this.user = null;
        this.profile = null;
        this.communities = [];
      }
    },

    /** Get Session **/
    async getSession() {
      const user = auth.currentUser;
      if (user) {
        try {
          await this.setAuth(user);
          if (this.profile) {
            await this.fetchCommunities(); // Ensure communities are fetched
          }

          if (!this.profile?.currentCommunityId) {
            console.warn(
              "No active community found. Redirecting to community setup."
            );
          }
        } catch (error) {
          console.error("Error in getSession:", error.message);
          this.setAuth(null); // Reset state on failure
        }
      } else {
        this.setAuth(null); // Reset state if no user is logged in
      }
    },

    /** Track Authentication Changes **/
    async trackAuthChanges() {
      onAuthStateChanged(auth, async (user) => {
        await this.setAuth(user);
      });
    },

    /** Track Profile Changes **/
    async trackProfileChanges(uid) {
      const profileRef = doc(db, "profiles", uid);
      onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          const profileData = doc.data();
          this.profile = {
            ...profileData,
            communityIds: profileData.communityIds || [],
            currentCommunityId: profileData.currentCommunityId || null,
          };
          LocalStorage.set("userProfile", JSON.stringify(this.profile));
        } else {
          this.profile = null;
          LocalStorage.remove("userProfile");
        }
      });
    },

    async updateProfile(updates) {
      try {
        // Remove undefined fields
        Object.keys(updates).forEach((key) => {
          if (updates[key] === undefined) {
            delete updates[key];
          }
        });

        // Handle avatar upload if provided
        if (updates.avatarFile) {
          const storage = getStorage();
          const avatarRef = storageRef(storage, `avatars/${this.user.uid}`);
          const snapshot = await uploadBytes(avatarRef, updates.avatarFile);
          updates.avatarUrl = await getDownloadURL(snapshot.ref);
          delete updates.avatarFile;
        }

        // Update profile in Firestore
        const userDoc = doc(db, "profiles", this.user.uid);
        await updateDoc(userDoc, updates);

        // Update local profile state
        this.profile = { ...this.profile, ...updates };
        LocalStorage.set("userProfile", JSON.stringify(this.profile));
      } catch (error) {
        console.error("Error updating profile:", error.message);
        throw new Error("Unable to update profile.");
      }
    },

    /** Fetch Communities **/
    async fetchCommunities() {
      try {
        if (this.profile?.communityIds) {
          this.communities = [...this.profile.communityIds];
        } else {
          console.warn("No communities found for the user.");
          this.communities = [];
        }
      } catch (error) {
        console.error("Error fetching communities:", error.message);
      }
    },

    /** Validate Community Selection **/
    async validateCommunitySelection(selectedCommunityId) {
      if (!this.profile?.communityIds.includes(selectedCommunityId)) {
        throw new Error(
          "Selected community is not associated with your account."
        );
      }
    },

    /** Validate Community Selection **/
    async validateCommunityAccess(communityId) {
      if (!this.profile?.communityIds.includes(communityId)) {
        throw new Error("You do not have access to this community.");
      }
    },

    /** Switch Community **/
    async switchCommunity(communityId) {
      try {
        if (!this.profile?.communityIds.includes(communityId)) {
          throw new Error("You are not a member of this community.");
        }

        await updateDoc(doc(db, "profiles", this.user.uid), {
          currentCommunityId: communityId,
        });

        this.profile.currentCommunityId = communityId;
        LocalStorage.set("userProfile", JSON.stringify(this.profile));
      } catch (error) {
        console.error("Error switching community:", error.message);
        throw new Error(
          error.message || "Unable to switch community. Please try again."
        );
      }
    },

    /** Create Community **/
    async createCommunity(communityName) {
      try {
        const userId = this.user?.uid;
        if (!userId) throw new Error("User is not logged in.");

        // Validate the community name length and format
        if (communityName.length < 4 || communityName.length > 40) {
          throw new Error(
            "Community name must be between 4 and 40 characters."
          );
        }

        const namePattern = /^[a-zA-Z0-9 ]+$/; // Only letters, numbers, and spaces
        if (!namePattern.test(communityName)) {
          throw new Error(
            "Community name can only contain letters, numbers, and spaces."
          );
        }

        // Normalize the community name: trim spaces, lowercase, and remove extra spaces
        const normalizedCommunityName = communityName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " "); // Ensure single spaces between words

        // Generate a community ID in camelCase followed by a dash and random identifier
        const communityId = `${normalizedCommunityName
          .replace(/ ([a-z])/g, (match) => match.trim().toUpperCase()) // Convert to camelCase
          .replace(/ /g, "")}-${Math.random().toString(36).substr(2, 4)}`;

        // Check for duplicate community names in the database
        const querySnapshot = await getDocs(
          query(
            collection(db, "communities"),
            where("communityName", "==", normalizedCommunityName)
          )
        );
        if (!querySnapshot.empty) {
          throw new Error(
            "Community name already exists. Please choose another name."
          );
        }

        // Create the community document
        await setDoc(doc(db, "communities", communityId), {
          communityId,
          communityName: normalizedCommunityName,
          createdBy: userId,
          members: [{ userId, role: "leader" }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Update the user's profile with the new community
        await updateDoc(doc(db, "profiles", userId), {
          communityIds: arrayUnion(communityId),
          currentCommunityId: communityId,
        });

        return communityId;
      } catch (error) {
        console.error("Error creating community:", error.message);
        throw new Error(error.message || "Unable to create community.");
      }
    },

    /** Join Community **/
    async joinCommunity(juntosLivingCommunityId) {
      try {
        const communityDoc = doc(db, "communities", juntosLivingCommunityId);
        const communitySnap = await getDoc(communityDoc);

        if (!communitySnap.exists()) {
          throw new Error("Community ID not found.");
        }

        // Add the user as a member
        await updateDoc(communityDoc, {
          [`members.${this.user.uid}`]: { role: "member" },
        });

        // Update the user's profile
        await updateDoc(doc(db, "profiles", this.user.uid), {
          communityIds: arrayUnion(juntosLivingCommunityId),
          currentCommunityId: juntosLivingCommunityId,
        });
      } catch (error) {
        console.error("Error joining community:", error.message);
        throw new Error(error.message || "Unable to join community.");
      }
    },
    //Handle the community switch and trigger refreshes in related stores.
    async switchCommunityAndRefresh(communityId) {
      try {
        // Validate and switch community
        await this.switchCommunity(communityId);

        // Trigger refreshes in related stores
        const learningsStore = useLearningsStore();
        const chatStore = useChatStore();

        await learningsStore.fetchLearningItems(communityId);
        await chatStore.fetchMessagesOnCommunity(communityId);

        console.log(`Switched to community ${communityId} and refreshed data.`);
      } catch (error) {
        console.error(
          "Error switching community and refreshing data:",
          error.message
        );
        throw new Error("Failed to switch community. Please try again.");
      }
    },

    /** Login **/
    async login(formData) {
      try {
        await login(formData); // Utilize the `login` method from `utils/firebaseAuth.js`

        // Fetch the current user from Firebase Auth
        const currentUser = auth.currentUser;
        if (currentUser) {
          this.user = currentUser;

          // Fetch profile and initialize related data
          await this.fetchProfile(currentUser.uid);
          await this.fetchCommunities();
        }
      } catch (error) {
        console.error("Login error:", error.message);
        throw new Error(error.message || "Unable to login. Please try again.");
      }
    },

    /** Logout **/
    async logout() {
      try {
        await logout(); // Perform Firebase logout
        this.user = null;
        this.profile = null;
        this.communities = [];
        this.currentCommunity = null;
        LocalStorage.remove("userProfile");
      } catch (error) {
        console.error("Logout error:", error.message);
        throw new Error("Unable to logout. Please try again.");
      }
    },
  },
});
