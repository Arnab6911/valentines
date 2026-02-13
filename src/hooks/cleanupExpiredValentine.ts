import { doc, deleteDoc } from "firebase/firestore";
import { ref, listAll, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export async function cleanupExpiredValentine(
  valentineId: string,
  photoPaths: string[] = [],
  aiArtPath?: string
) {
  try {
    // 1️⃣ Delete all images
    for (const path of photoPaths) {
      const photoRef = ref(storage, path);
      await deleteObject(photoRef);
    }

    // 2️⃣ Delete AI illustration (if exists)
    if (aiArtPath) {
      const aiRef = ref(storage, aiArtPath);
      await deleteObject(aiRef);
    }

    // 3️⃣ Delete entire valentine folder (safety)
    const folderRef = ref(storage, `valentines/${valentineId}`);
    const files = await listAll(folderRef);

    for (const item of files.items) {
      await deleteObject(item);
    }

    // 4️⃣ Delete Firestore document
    await deleteDoc(doc(db, "valentines", valentineId));

  } catch {
    // Intentionally swallow cleanup errors to avoid interrupting viewer flow.
  }
}
