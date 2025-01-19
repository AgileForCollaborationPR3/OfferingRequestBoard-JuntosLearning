import { defineStore } from "pinia";
import { db } from "../boot/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import { useProfileStore } from "./profile-store";

export const useLearningsStore = defineStore("learnings-store", {
  state: () => ({
    learningItems: [],
    loading: false,
    error: null,
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
    getLearningByType: (state) => (type) => {
      return state.learningItems.filter((item) => item.type === type);
    },
  },

  actions: {
    async addLearningItem(data) {
      try {
        this.loading = true;
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

    /** Fetch Learning Items of one Community **/
    async fetchLearningItems(communityId) {
      const profileStore = useProfileStore(); // Access the profile store
      try {
        this.loading = true;

        // Fetch learning items from the database
        const itemsQuery = query(
          collection(db, "learningItems"),
          where("communityId", "==", communityId)
        );
        const snapshot = await getDocs(itemsQuery);

        const items = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            formats: data.formats.map((format) => {
              const matchedFormat = this.availableFormatOptions.find(
                (option) => option.text === format
              );
              return matchedFormat
                ? { text: matchedFormat.text, icon: matchedFormat.icon }
                : { text: format, icon: null };
            }),
            offers: data.offers || 0,
            requests: data.requests || 0,
            avatarUrl: data.avatarUrl || "",
          };
        });

        // Extract unique userIds
        const userIds = [...new Set(items.map((item) => item.userId))];

        // Fetch profiles for all userIds
        const profiles = await profileStore.fetchProfiles(userIds);

        // Merge profiles into learning items
        this.learningItems = items.map((item) => {
          const userProfile =
            profiles.find((profile) => profile?.userId === item.userId) || {};
          return {
            ...item,
            user: {
              firstName: userProfile.firstName || "Unknown",
              lastName: userProfile.lastName || "",
              avatarUrl: userProfile.avatarUrl || "",
            },
          };
        });
      } catch (error) {
        console.error("Error fetching learning items:", error.message);
        this.error = "Failed to fetch learning items.";
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /** Get a single learning item by ID **/
    async getLearningItemById(id) {
      try {
        // First, try to find the item in the local state
        const existingItem = this.learningItems.find((item) => item.id === id);
        if (existingItem) {
          return existingItem;
        }

        // If not found, fetch it directly from the database
        const docRef = doc(db, "learningItems", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Format the fetched item
          const formattedItem = {
            id: docSnap.id,
            ...data,
            formats: data.formats.map((format) => {
              const matchedFormat = this.availableFormatOptions.find(
                (option) => option.text === format
              );
              return matchedFormat
                ? { text: matchedFormat.text, icon: matchedFormat.icon }
                : { text: format, icon: null };
            }),
          };

          // Optionally add it to the local state
          this.learningItems.push(formattedItem);

          return formattedItem;
        } else {
          throw new Error("Learning item not found.");
        }
      } catch (error) {
        console.error("Error fetching learning item by ID:", error.message);
        throw error;
      }
    },

    /** Submit an offer on a learning request **/
    async addOffer(offerData) {
      try {
        const offersRef = collection(db, "learningOffers"); // Collection for storing offers
        const docRef = await addDoc(offersRef, offerData);
        console.log("Offer added with ID:", docRef.id);
        return docRef.id;
      } catch (error) {
        console.error("Error adding offer:", error);
        throw new Error("Unable to add offer to Firebase");
      }
    },
    /** Join a learning offer **/
    async joinOffer(participationData) {
      try {
        const participationRef = collection(db, "learningParticipations"); // Collection for participations
        const docRef = await addDoc(participationRef, participationData);
        console.log("Participation recorded with ID:", docRef.id);
        return docRef.id;
      } catch (error) {
        console.error("Error adding participation:", error);
        throw new Error("Unable to join the learning offering");
      }
    },
  },
});
