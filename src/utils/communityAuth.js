import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../boot/firebase";

export const createCommunity = async (userId, communityName) => {
  if (!userId) throw new Error("User is not logged in.");

  const communityId = `${communityName.toLowerCase()}-${Math.random()
    .toString(36)
    .substr(2, 4)}`;

  // Check for duplicate community names
  const communityQuery = query(
    collection(db, "communities"),
    where("communityName", "==", communityName)
  );
  const existingCommunities = await getDocs(communityQuery);
  if (!existingCommunities.empty) {
    throw new Error("Community name already exists. Choose another.");
  }

  await setDoc(doc(db, "communities", communityId), {
    communityId,
    communityName,
    createdBy: userId,
    members: [{ userId, role: "leader" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return communityId;
};

export const joinCommunity = async (userId, communityId) => {
  const communityDoc = doc(db, "communities", communityId);
  const communitySnap = await getDoc(communityDoc);

  if (!communitySnap.exists()) throw new Error("Community ID not found.");

  await updateDoc(communityDoc, {
    members: arrayUnion({ userId, role: "member" }),
  });

  return communityId;
};
