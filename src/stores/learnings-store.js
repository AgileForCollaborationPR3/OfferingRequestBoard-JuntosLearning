import { defineStore } from "pinia";
import { db } from "../boot/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useProfileStore } from "./profile-store";
import { useChatStore } from "./chat-store";

export const useLearningsStore = defineStore("learnings-store", {
  state: () => ({
    learningItems: [],
    loading: false,
    error: null,
    learningOffers: [],
    learningParticipations: [],
    availableFormatOptions: [
      { text: "Company Tour", icon: "o_tour" },
      { text: "Expert Advice", icon: "o_verified" },
      { text: "Guest Lesson", icon: "o_school" },
      { text: "Hands-On Workshop", icon: "o_build" },
      { text: "Job Shadowing", icon: "o_visibility" },
      { text: "Lesson Series", icon: "o_library_books" },
      { text: "Mentoring/Coaching", icon: "o_supervisor_account" },
      { text: "Online Lesson", icon: "o_cast_for_education" },
      { text: "Q&A", icon: "o_contact_support" },
    ],
  }),

  getters: {
    getLearningByType: (state) => (type) =>
      state.learningItems.filter((item) => item.type === type),
  },

  actions: {
    /** Add a new learning item **/
    async addLearningItem(data) {
      try {
        this.loading = true;

        // Validate required fields
        if (data.isRequest === undefined) {
          throw new Error("isRequest is missing.");
        }

        if (!data.communityId || !data.userId || !data.title) {
          throw new Error(
            "Missing required fields for adding a learning item."
          );
        }

        const docRef = await addDoc(collection(db, "learningItems"), {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log("Learning item added with ID:", docRef.id);
      } catch (error) {
        console.error("Error adding learning item:", error.message);
        this.error = "Failed to add learning item.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /** Fetch all learning items for a community **/
    async fetchLearningItems(communityId) {
      try {
        this.loading = true;

        // Use currentCommunityId from the profile if communityId is not provided
        if (!communityId) {
          const profileStore = useProfileStore();
          communityId = profileStore.profile?.currentCommunityId;
        }

        // Validate the communityId
        if (!communityId) {
          throw new Error("Community ID is missing or undefined.");
        }

        const itemsQuery = query(
          collection(db, "learningItems"),
          where("communityId", "==", communityId)
        );
        const snapshot = await getDocs(itemsQuery);

        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          formats: this.formatOptions(doc.data().formats),
        }));

        const userIds = [...new Set(items.map((item) => item.userId))];
        const profiles = await this.fetchProfiles(userIds);

        this.learningItems = items.map((item) => ({
          ...item,
          user:
            profiles.find((profile) => profile.userId === item.userId) ||
            this.defaultUserProfile(),
        }));
      } catch (error) {
        console.error("Error fetching learning items:", error.message);
        this.error = "Failed to fetch learning items.";
      } finally {
        this.loading = false;
      }
    },

    /** Fetch a single learning item by ID **/
    async getLearningItemById(id) {
      const existingItem = this.learningItems.find((item) => item.id === id);
      if (existingItem) return existingItem;

      try {
        const docSnap = await getDoc(doc(db, "learningItems", id));
        if (!docSnap.exists()) throw new Error("Learning item not found.");

        const data = docSnap.data();
        const formattedItem = {
          id: docSnap.id,
          ...data,
          formats: this.formatOptions(data.formats),
        };

        this.learningItems.push(formattedItem);
        return formattedItem;
      } catch (error) {
        console.error("Error fetching learning item by ID:", error.message);
        throw error;
      }
    },

    /** Add a new learning offer **/
    async addLearningOffer(offerData) {
      try {
        const offerRef = await addDoc(collection(db, "learningOffers"), {
          ...offerData,
          createdAt: new Date().toISOString(),
        });

        const chatStore = useChatStore();
        await chatStore.addMessage({
          learningId: offerData.learningId,
          learningOfferId: offerRef.id,
          userId: offerData.userId,
          message: offerData.reason, // Directly use the reason as the message
          firstName: offerData.firstName,
          lastName: offerData.lastName,
          avatarUrl: offerData.avatarUrl || "",
          messageType: "offer",
        });

        console.log("Learning offer added with ID:", offerRef.id);
        return offerRef.id;
      } catch (error) {
        console.error("Error adding learning offer:", error.message);
        throw new Error("Failed to add learning offer.");
      }
    },

    async createLearningOffer(data) {
      if (!data.firstName || !data.lastName) {
        throw new Error("User profile details are missing.");
      }

      try {
        const offerRef = await addDoc(collection(db, "learningOffers"), {
          ...data,
          createdAt: new Date().toISOString(),
        });

        return { id: offerRef.id, ...data };
      } catch (error) {
        console.error("Error creating learning offer:", error.message);
        throw new Error("Failed to create learning offer.");
      }
    },

    async createLearningParticipation(data) {
      if (!data.firstName || !data.lastName) {
        throw new Error("User profile details are missing.");
      }

      try {
        const participationRef = await addDoc(
          collection(db, "learningParticipations"),
          {
            ...data,
            createdAt: new Date().toISOString(),
          }
        );

        return { id: participationRef.id, ...data };
      } catch (error) {
        console.error("Error creating learning participation:", error.message);
        throw new Error("Failed to create learning participation.");
      }
    },

    /** Accept Learning Offer **/

    async acceptLearningOffer(learningId, learningOfferId) {
      try {
        const learningRef = doc(db, "learningItems", learningId);

        // Update the learning item's stage and acceptedOfferId
        await updateDoc(learningRef, {
          stage: "scheduled",
          acceptedOfferId: learningOfferId,
          updatedAt: new Date().toISOString(),
        });

        // Update the local state
        const learningIndex = this.learningItems.findIndex(
          (item) => item.id === learningId
        );
        if (learningIndex !== -1) {
          this.learningItems[learningIndex].stage = "scheduled";
          this.learningItems[learningIndex].acceptedOfferId = learningOfferId;
        }

        console.log("Offer accepted successfully!");
      } catch (error) {
        console.error("Error accepting offer:", error.message);
        throw new Error("Failed to accept the offer.");
      }
    },

    /** Update learning offers **/
    async updateLearningItem(learningId, updates) {
      try {
        const learningRef = doc(db, "learningItems", learningId);
        await updateDoc(learningRef, updates);

        // Update local state
        const learningIndex = this.learningItems.findIndex(
          (item) => item.id === learningId
        );
        if (learningIndex !== -1) {
          this.learningItems[learningIndex].stage = "scheduled";
          this.learningItems[learningIndex] = {
            ...this.learningItems[learningIndex],
            ...updates,
          };
        }
      } catch (error) {
        console.error("Error updating learning item:", error.message);
        throw new Error("Failed to update learning item.");
      }
    },

    /** Fetch all offers for a specific learning item **/
    async fetchLearningOffers(learningId) {
      try {
        const offersQuery = query(
          collection(db, "learningOffers"),
          where("learningId", "==", learningId)
        );
        const snapshot = await getDocs(offersQuery);
        this.learningOffers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching learning offers:", error.message);
        this.error = "Failed to fetch learning offers.";
      }
    },

    /** Fetch all participations for a specific learning item **/
    async fetchLearningParticipations(learningId) {
      try {
        const participationsQuery = query(
          collection(db, "learningParticipations"),
          where("learningId", "==", learningId)
        );
        const snapshot = await getDocs(participationsQuery);

        this.learningParticipations = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error(`Error fetching participations:`, error.message);
        this.error = "Failed to fetch learning participations.";
      }
    },

    /** Add Participant **/
    async addParticipant(learningId, userId) {
      try {
        const learningRef = doc(db, "learningItems", learningId);

        // Update Firestore document
        await updateDoc(learningRef, {
          acceptedParticipationsId: arrayUnion(userId),
        });

        // Update local state
        const learningIndex = this.learningItems.findIndex(
          (item) => item.id === learningId
        );
        if (learningIndex !== -1) {
          this.learningItems[learningIndex].acceptedParticipationsId.push(
            userId
          );
        }
      } catch (error) {
        console.error("Error adding participant:", error.message);
        throw new Error("Failed to add participant.");
      }
    },

    /** Helper: Fetch profiles for user IDs **/
    async fetchProfiles(userIds) {
      const profileStore = useProfileStore();
      return profileStore.fetchProfiles(userIds);
    },

    /** Helper: Format options **/
    formatOptions(formats) {
      return formats.map((format) => {
        const match = this.availableFormatOptions.find(
          (option) => option.text === format
        );
        return match || { text: format, icon: null };
      });
    },

    /** Helper: Default user profile **/
    defaultUserProfile() {
      return {
        firstName: "Unknown",
        lastName: "",
        avatarUrl: "",
      };
    },
  },
});
