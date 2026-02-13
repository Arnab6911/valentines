import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";

import { useTheme } from "@/contexts/ThemeContext";

interface ShareCardProps {
  shareUrl: string;
}

export default function ShareCard({ shareUrl }: ShareCardProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    setQrValue(shareUrl || "");
  }, [shareUrl]);

  const romanticMessage = useMemo(
    () =>
      `
Hey my love 💖✨

I made something special just for you 🥹💌
Our private memory page is waiting...

Click here and feel the magic:
${shareUrl}

Forever yours ❤️
`.trim(),
    [shareUrl],
  );

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(romanticMessage)}`;
  const gmailShareUrl = `https://mail.google.com/mail/?view=cm&su=${encodeURIComponent("Our Surprise 💖")}&body=${encodeURIComponent(romanticMessage)}`;
  const instagramShareUrl = "https://www.instagram.com/";

  const copyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`rounded-3xl border p-5 md:p-6 backdrop-blur-xl ${theme.cardBackground} ${theme.glowColor} ${theme.divider}`}
    >
      <h3 className={`text-xl font-semibold ${theme.primaryText}`}>Share Your Surprise 💌</h3>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={shareUrl}
          className={`flex-1 p-3 rounded-xl border ${theme.inputBackground} ${theme.inputText}`}
        />
        <button
          type="button"
          onClick={copyLink}
          className={`px-6 py-3 min-h-[44px] rounded-xl transition-colors ${theme.buttonSecondary}`}
        >
          Copy Link 🔗
        </button>
      </div>

      {copied && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-2 text-sm ${theme.secondaryText}`}>
          Link copied 💕
        </motion.p>
      )}

      <div className="mt-6 flex justify-center">
        <div className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(255,105,180,0.2)]">
          {qrValue ? <QRCode value={qrValue} size={180} bgColor="#ffffff" fgColor="#e11d48" /> : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <motion.a
          href={whatsappShareUrl}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 min-h-[44px] text-white font-semibold bg-gradient-to-r ${theme.accentGradient}`}
        >
          WhatsApp 💬
        </motion.a>
        <motion.a
          href={gmailShareUrl}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 min-h-[44px] text-white font-semibold bg-gradient-to-r ${theme.accentGradient}`}
        >
          Gmail 📧
        </motion.a>
        <motion.a
          href={instagramShareUrl}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 min-h-[44px] text-white font-semibold bg-gradient-to-r ${theme.accentGradient}`}
        >
          Instagram 📸
        </motion.a>
      </div>

      <p className={`mt-3 text-sm text-center ${theme.secondaryText}`}>
        Copy link and paste in Instagram Story 💕
      </p>
    </motion.section>
  );
}
