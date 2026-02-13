import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanupExpiredValentine } from "./cleanupExpiredValentine";

export async function getValentineWithStatus(uid: string) {
  const ref = doc(db, "valentines", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { status: "not-created", data: null };
  }

  const data = snap.data();
  const now = new Date();
  const expiresAt = data.expiresAt?.toDate?.() ?? null;

  if (expiresAt && expiresAt < now) {
    // 🔥 CLEANUP TRIGGER
    const photoPaths = (data.images || [])
      .map((p: { path?: string; id?: string }) =>
        p.path ?? (p.id ? `valentines/${uid}/${p.id}` : undefined),
      )
      .filter(Boolean);
    const aiArtPath = data.aiArt?.imagePath;

    await cleanupExpiredValentine(uid, photoPaths, aiArtPath);

    return { status: "expired", data: null };
  }

  if (data.isDeleted) {
    return { status: "deleted", data: null };
  }

  if (!data.hasContent) {
    return { status: "not-created", data: null };
  }

  return { status: "ok", data };
}
