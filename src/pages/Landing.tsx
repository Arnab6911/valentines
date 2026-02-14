import { Link } from "react-router-dom";

import { useTheme } from "@/contexts/ThemeContext";

const featureCards = [
  {
    icon: "🔒",
    title: "Private Valentine Page",
    description: "Share one personal link with optional lock so your surprise stays just for your person.",
  },
  {
    icon: "🛤️",
    title: "Relationship Timeline",
    description: "Capture your journey with dated milestones, photos, and heartfelt notes in order.",
  },
  {
    icon: "⏱️",
    title: "Live Love Timer",
    description: "Show real-time relationship duration with years, months, days, and every second.",
  },
  {
    icon: "🖼️",
    title: "Romantic Slideshow",
    description: "Present memories in a smooth carousel with captions and touch-friendly controls.",
  },
  {
    icon: "📲",
    title: "Installable App Experience",
    description: "Open the experience like an app from home screen with PWA support.",
  },
  {
    icon: "📤",
    title: "Easy Sharing",
    description: "Share quickly through WhatsApp, Email, copied link, or QR scan in a few taps.",
  },
];

const howItWorksSteps = [
  {
    icon: "1️⃣",
    title: "Create Your Memory Space",
    description: "Log in, write your message, upload photos, and set your relationship details.",
  },
  {
    icon: "2️⃣",
    title: "Make It Yours",
    description: "Pick your theme, timeline moments, and optional viewer password lock.",
  },
  {
    icon: "3️⃣",
    title: "Share the Surprise",
    description: "Send the private link or QR and let your partner open the experience.",
  },
  {
    icon: "4️⃣",
    title: "Watch the Reveal",
    description: "They open the page, feel the story, and relive your journey together.",
  },
];

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.primaryText}`}>
      <section className="mx-auto w-full max-w-screen-lg px-4 py-16 md:py-24">
        <p className={`text-xs md:text-sm uppercase tracking-[0.22em] ${theme.secondaryText}`}>Surprise Gift</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
          Build a deeply personal surprise
          <br className="hidden md:block" /> they will never forget.
        </h1>
        <p className={`mt-6 max-w-2xl text-base md:text-lg leading-relaxed ${theme.secondaryText}`}>
          Design one private page that tells your love story with message, photos, timeline, and live duration.
          Emotional, clean, and ready to share in minutes.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/auth" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonPrimary}`}>
            Start Creating 💌
          </Link>
          <Link to="/about" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonSecondary}`}>
            Explore Features ✨
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-xl px-4 py-3 text-sm ${theme.cardBackground}`}>Private by design</div>
          <div className={`rounded-xl px-4 py-3 text-sm ${theme.cardBackground}`}>Mobile-first experience</div>
          <div className={`rounded-xl px-4 py-3 text-sm ${theme.cardBackground}`}>Installable as app</div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">Features Overview</h2>
        <p className={`mt-2 text-sm md:text-base ${theme.secondaryText}`}>
          Everything you need to create and share a meaningful digital Valentine experience.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {featureCards.map((feature) => (
            <article key={feature.title} className={`rounded-2xl p-5 md:p-6 ${theme.cardBackground} ${theme.glowColor}`}>
              <div className="text-2xl">{feature.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{feature.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${theme.secondaryText}`}>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">How It Works</h2>
        <ol className="mt-6 space-y-4">
          {howItWorksSteps.map((step) => (
            <li key={step.title} className={`rounded-2xl p-5 md:p-6 ${theme.cardBackground}`}>
              <p className="text-base font-semibold">
                {step.icon} {step.title}
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${theme.secondaryText}`}>{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">How to Install as App</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className={`rounded-2xl p-6 ${theme.cardBackground}`}>
            <p className="text-lg font-semibold">🤖 Android</p>
            <ul className={`mt-3 space-y-2 text-sm ${theme.secondaryText}`}>
              <li>1. Open your surprise page in Chrome.</li>
              <li>2. Tap menu ⋮ and choose “Install app” or “Add to Home screen”.</li>
              <li>3. Confirm to launch it like a native app anytime.</li>
            </ul>
          </div>
          <div className={`rounded-2xl p-6 ${theme.cardBackground}`}>
            <p className="text-lg font-semibold">🍎 iPhone</p>
            <ul className={`mt-3 space-y-2 text-sm ${theme.secondaryText}`}>
              <li>1. Open your surprise page in Safari.</li>
              <li>2. Tap Share ⬆️ and select “Add to Home Screen”.</li>
              <li>3. Save and open from your home screen like an app.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-20">
        <div className={`rounded-3xl p-6 md:p-8 text-white bg-gradient-to-r ${theme.accentGradient}`}>
          <h2 className="text-2xl md:text-3xl font-semibold">Why This Is Special</h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-white/95">
            Anyone can send a message. This helps you send a moment: your memories, your timeline, your shared time,
            and your emotion in one intentional experience.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link to="/auth" className="rounded-xl bg-white/95 text-neutral-900 px-6 py-3 text-center font-semibold">
              Create Yours Now
            </Link>
            <Link to="/how-it-works" className="rounded-xl border border-white/70 px-6 py-3 text-center font-semibold">
              Full Usage Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
