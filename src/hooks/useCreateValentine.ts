import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function createValentineIfNotExists(uid: string) {
  const ref = doc(db, "valentines", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(
      now.toMillis() + 30 * 24 * 60 * 60 * 1000 // 30 days
    );

    await setDoc(ref, {
      creatorId: uid,
      personalMessage: "",
      images: [],
      timeline: [],
      theme: "romantic",
      hasContent: false,
      isDeleted: false,
      createdAt: now,
      expiresAt,
    });
  }
}
