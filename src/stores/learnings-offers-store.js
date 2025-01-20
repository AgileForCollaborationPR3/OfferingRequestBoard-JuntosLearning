import { defineStore } from "pinia";
import { db } from "../boot/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const useLearningsOffersStore = defineStore("learnings-offers-store", {
  state: () => ({
    offers: [],
  }),

  actions: {
    /** Fetch offers by learning ID **/
    async fetchOffersByLearningId(learningId) {
      try {
        const offersQuery = query(
          collection(db, "learningOffers"),
          where("learningId", "==", learningId)
        );

        const snapshot = await getDocs(offersQuery);
        this.offers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        return this.offers;
      } catch (error) {
        console.error("Error fetching offers:", error.message);
        throw new Error("Unable to fetch offers.");
      }
    },
  },
});
