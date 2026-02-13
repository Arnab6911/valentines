import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";
import { THEMES, ThemeName, isThemeName, useTheme } from "@/contexts/ThemeContext";
import { createValentineIfNotExists } from "@/hooks/useCreateValentine";
import { db, storage } from "@/lib/firebase";

interface ImageData {
  url: string;
  caption?: string;
  id: string;
}

interface TimelineEntry {
  imageUrl: string;
  date: string;
  title: string;
  description: string;
}

const themeLabels: Record<ThemeName, string> = {
  romantic: "Romantic",
  darkElegant: "Dark Elegant",
  minimalWhite: "Minimal White",
  goldenAnniversary: "Golden Anniversary",
  galaxyLove: "Galaxy Love",
};

function isTimelineEntry(value: unknown): value is TimelineEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as TimelineEntry;
  return (
    typeof entry.imageUrl === "string" &&
    typeof entry.date === "string" &&
    typeof entry.title === "string" &&
    typeof entry.description === "string"
  );
}

export default function CreatorDashboard() {
  const { user, loading } = useAuth();
  const { theme, themeName, setThemeName } = useTheme();

  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [relationshipStartDate, setRelationshipStartDate] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [timelineUploading, setTimelineUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [timelineDate, setTimelineDate] = useState("");
  const [timelineTitle, setTimelineTitle] = useState("");
  const [timelineDescription, setTimelineDescription] = useState("");
  const [timelineImageFile, setTimelineImageFile] = useState<File | null>(null);

  const cardClass = useMemo(
    () => `${theme.cardBackground} ${theme.glowColor} p-6 rounded-2xl`,
    [theme.cardBackground, theme.glowColor],
  );

  const loadExistingData = useCallback(async () => {
    if (!user) return;

    const docRef = doc(db, "valentines", user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    setMessage(data.personalMessage || "");
    setImages(data.images || []);

    if (Array.isArray(data.timeline)) {
      const parsedTimeline = data.timeline
        .filter(isTimelineEntry)
        .sort((a, b) => a.date.localeCompare(b.date));
      setTimeline(parsedTimeline);
    } else {
      setTimeline([]);
    }

    if (typeof data.relationshipStartDate === "string") {
      setRelationshipStartDate(data.relationshipStartDate);
    } else if (data.relationshipStartDate?.toDate) {
      setRelationshipStartDate(data.relationshipStartDate.toDate().toISOString().slice(0, 10));
    } else {
      setRelationshipStartDate("");
    }

    if (isThemeName(data.theme)) {
      setThemeName(data.theme);
    }
  }, [setThemeName, user]);

  useEffect(() => {
    if (!user) return;

    createValentineIfNotExists(user.uid);
    loadExistingData();
  }, [loadExistingData, user]);

  const handleThemeChange = async (nextTheme: ThemeName) => {
    setThemeName(nextTheme);
    if (!user) return;

    await updateDoc(doc(db, "valentines", user.uid), {
      theme: nextTheme,
      updatedAt: new Date(),
    });
  };

  const handleSave = async () => {
    if (!user) return;

    await updateDoc(doc(db, "valentines", user.uid), {
      personalMessage: message,
      images,
      timeline,
      relationshipStartDate: relationshipStartDate || "",
      theme: themeName,
      hasContent: true,
      isDeleted: false,
      updatedAt: new Date(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || images.length >= 10) return;

    const files = Array.from(e.target.files);
    if (files.length + images.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    setUploading(true);
    try {
      const newImages: ImageData[] = [];

      for (const file of files) {
        const imageId = Date.now() + Math.random().toString(36).slice(2, 11);
        const storageRef = ref(storage, `valentines/${user.uid}/${imageId}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        newImages.push({ url, caption: "", id: imageId });
      }

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      await updateDoc(doc(db, "valentines", user.uid), {
        images: updatedImages,
        hasContent: true,
        updatedAt: new Date(),
      });
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const addTimelineEntry = async () => {
    if (!user) return;
    if (!timelineImageFile || !timelineDate || !timelineTitle.trim() || !timelineDescription.trim()) {
      alert("Please add image, date, title, and description.");
      return;
    }

    setTimelineUploading(true);
    try {
      const entryId = Date.now() + Math.random().toString(36).slice(2, 11);
      const storageRef = ref(storage, `valentines/${user.uid}/timeline/${entryId}`);

      await uploadBytes(storageRef, timelineImageFile);
      const imageUrl = await getDownloadURL(storageRef);

      const nextEntry: TimelineEntry = {
        imageUrl,
        date: timelineDate,
        title: timelineTitle.trim(),
        description: timelineDescription.trim(),
      };

      const updatedTimeline = [...timeline, nextEntry].sort((a, b) => a.date.localeCompare(b.date));
      setTimeline(updatedTimeline);

      await updateDoc(doc(db, "valentines", user.uid), {
        timeline: updatedTimeline,
        hasContent: true,
        updatedAt: new Date(),
      });

      setTimelineDate("");
      setTimelineTitle("");
      setTimelineDescription("");
      setTimelineImageFile(null);
    } catch {
      alert("Timeline upload failed. Please try again.");
    } finally {
      setTimelineUploading(false);
    }
  };

  const removeTimelineEntry = async (index: number) => {
    if (!user) return;
    if (!window.confirm("Remove this timeline entry?")) return;

    const targetEntry = timeline[index];
    try {
      await deleteObject(ref(storage, targetEntry.imageUrl));
    } catch {
      // Continue to keep Firestore timeline consistent even if storage delete fails.
    }

    const updatedTimeline = timeline.filter((_, i) => i !== index);
    setTimeline(updatedTimeline);

    await updateDoc(doc(db, "valentines", user.uid), {
      timeline: updatedTimeline,
      updatedAt: new Date(),
    });
  };

  const updateCaption = (id: string, caption: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const removeImage = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Remove this image?")) return;

    try {
      await deleteObject(ref(storage, `valentines/${user.uid}/${id}`));

      const updatedImages = images.filter((img) => img.id !== id);
      setImages(updatedImages);

      await updateDoc(doc(db, "valentines", user.uid), {
        images: updatedImages,
        updatedAt: new Date(),
      });
    } catch {
      alert("Delete failed. Please try again.");
    }
  };

  const emergencyDelete = async () => {
    if (!user) return;
    if (!window.confirm("This will permanently delete everything. Are you sure?")) return;

    setDeleting(true);
    try {
      await Promise.allSettled([
        ...images.map((img) => deleteObject(ref(storage, `valentines/${user.uid}/${img.id}`))),
        ...timeline.map((entry) => deleteObject(ref(storage, entry.imageUrl))),
      ]);

      await updateDoc(doc(db, "valentines", user.uid), {
        isDeleted: true,
        images: [],
        timeline: [],
        personalMessage: "",
        hasContent: false,
      });

      setImages([]);
      setTimeline([]);
      setMessage("");
    } catch {
      alert("Delete failed. Please try again.");
    } finally {
      setDeleting(false);
      alert("Valentine deleted successfully.");
    }
  };

  const shareUrl = user ? `${window.location.origin}/viewer/${user.uid}` : "";

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className={`min-h-screen p-10 text-center ${theme.background} ${theme.primaryText}`}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen p-10 text-center ${theme.background} ${theme.primaryText}`}>
        Please log in.
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 px-4 ${theme.background} ${theme.primaryText}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-screen-lg mx-auto">
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`text-4xl font-handwritten text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}
        >
          Creator Dashboard
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`${cardClass} mb-6`}
        >
          <h3 className="text-xl font-semibold mb-4">Personal Message</h3>

          <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Theme</label>
          <select
            value={themeName}
            onChange={(e) => handleThemeChange(e.target.value as ThemeName)}
            className={`w-full mb-4 p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
          >
            {(Object.keys(THEMES) as ThemeName[]).map((name) => (
              <option key={name} value={name}>
                {themeLabels[name]}
              </option>
            ))}
          </select>

          <textarea
            className={`w-full h-32 p-4 rounded-xl border resize-none mb-4 focus:outline-none focus:ring-2 ${theme.inputBackground} ${theme.inputText}`}
            placeholder="Write something from your heart..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Relationship start date</label>
            <input
              type="date"
              value={relationshipStartDate}
              onChange={(e) => setRelationshipStartDate(e.target.value)}
              className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 ${theme.inputBackground} ${theme.inputText}`}
            />
          </div>

          <button onClick={handleSave} className={`px-6 py-3 min-h-[44px] rounded-xl transition-colors ${theme.buttonPrimary}`}>
            Save Message
          </button>

          {saved && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-2 ${theme.secondaryText}`}>
              Message saved.
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${cardClass} mb-6`}
        >
          <h3 className="text-xl font-semibold mb-4">Photos ({images.length}/10)</h3>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading || images.length >= 10}
            className="mb-4"
          />

          {uploading && <p className={theme.secondaryText}>Uploading...</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((img, index) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <img src={img.url} alt={`Photo ${index + 1}`} className="w-full h-32 object-cover rounded-xl" />
                <button
                  onClick={() => removeImage(img.id)}
                  className={`absolute top-2 right-2 rounded-full w-9 h-9 min-h-[44px] opacity-0 group-hover:opacity-100 transition-opacity ${theme.buttonDanger}`}
                >
                  ×
                </button>
                <input
                  type="text"
                  placeholder="Add caption..."
                  value={img.caption || ""}
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                  className={`mt-2 w-full p-2 text-sm rounded border ${theme.inputBackground} ${theme.inputText}`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`${cardClass} mb-6`}
        >
          <h3 className="text-xl font-semibold mb-4">Our Journey Timeline</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Timeline image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setTimelineImageFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Date</label>
              <input
                type="date"
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
                className={`w-full p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
              />
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Title</label>
              <input
                type="text"
                value={timelineTitle}
                onChange={(e) => setTimelineTitle(e.target.value)}
                placeholder="Our First Date"
                className={`w-full p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${theme.secondaryText}`}>Description</label>
              <input
                type="text"
                value={timelineDescription}
                onChange={(e) => setTimelineDescription(e.target.value)}
                placeholder="We had coffee near the park."
                className={`w-full p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
              />
            </div>
          </div>

          <button
            onClick={addTimelineEntry}
            disabled={timelineUploading}
            className={`mt-4 px-6 py-3 min-h-[44px] rounded-xl transition-colors ${theme.buttonPrimary}`}
          >
            {timelineUploading ? "Adding..." : "Add Timeline Entry"}
          </button>

          <div className="mt-6 space-y-3">
            {timeline.map((entry, index) => (
              <div key={`${entry.date}-${entry.title}-${index}`} className={`p-4 rounded-xl ${theme.cardBackground}`}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <img
                    src={entry.imageUrl}
                    alt={entry.title}
                    className="w-full md:w-40 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className={`text-sm ${theme.secondaryText}`}>{entry.date}</p>
                    <p className="font-semibold">{entry.title}</p>
                    <p className={`${theme.secondaryText}`}>{entry.description}</p>
                  </div>
                  <button
                    onClick={() => removeTimelineEntry(index)}
                    className={`self-start px-3 py-2 min-h-[44px] rounded-lg text-sm ${theme.buttonDanger}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`${cardClass} mb-6`}
        >
          <h3 className="text-xl font-semibold mb-4">Share Your Valentine</h3>
          <div className="flex flex-col sm:flex-row gap-2">
              <input
              readOnly
              value={shareUrl}
              className={`flex-1 p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
            />
            <button onClick={copyLink} className={`px-6 py-3 min-h-[44px] rounded-xl transition-colors ${theme.buttonSecondary}`}>
              Copy
            </button>
          </div>
          {copied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-2 ${theme.secondaryText}`}>
              Link copied.
            </motion.p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cardClass}
        >
          <button
            onClick={emergencyDelete}
            disabled={deleting}
            className={`w-full py-3 min-h-[44px] rounded-xl transition-colors ${theme.buttonDanger}`}
          >
            {deleting ? "Deleting..." : "Emergency Delete"}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
