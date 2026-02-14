import { Link } from "react-router-dom";

import { useTheme } from "@/contexts/ThemeContext";

const features = [
  {
    icon: "🔒",
    title: "Private Valentine Page",
    description: "Create a personal page link that can be protected and shared only with your person.",
  },
  {
    icon: "🛤️",
    title: "Relationship Timeline",
    description: "Tell your journey with dated milestones, photos, and emotional notes.",
  },
  {
    icon: "⏱️",
    title: "Live Love Timer",
    description: "Display real-time years, months, days, and seconds of your relationship.",
  },
  {
    icon: "🖼️",
    title: "Romantic Slideshow",
    description: "Showcase memories in a smooth, elegant carousel experience.",
  },
  {
    icon: "📲",
    title: "Installable App Experience",
    description: "Use SurpriseGift like an app from your home screen on mobile.",
  },
  {
    icon: "📤",
    title: "Easy Sharing",
    description: "Distribute your page instantly through WhatsApp, Email, and QR.",
  },
];

const steps = [
  { icon: "1️⃣", text: "Sign in and open the Creator Dashboard." },
  { icon: "2️⃣", text: "Add your message, images, timeline entries, and theme." },
  { icon: "3️⃣", text: "Save and generate your private share link/QR." },
  { icon: "4️⃣", text: "Send it and let your partner open the full experience." },
];

export default function About() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.primaryText}`}>
      <section className="mx-auto w-full max-w-screen-lg px-4 py-16 md:py-24">
        <p className={`text-xs md:text-sm uppercase tracking-[0.22em] ${theme.secondaryText}`}>About SurpriseGift</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Turn memories into a meaningful digital love experience.</h1>
        <p className={`mt-6 max-w-3xl text-base md:text-lg leading-relaxed ${theme.secondaryText}`}>
          SurpriseGift is built for one goal: helping you express love through a crafted experience, not just a plain
          message. It combines creator simplicity with a polished viewer journey.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link to="/auth" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonPrimary}`}>
            Start a Surprise 💖
          </Link>
          <Link to="/how-it-works" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonSecondary}`}>
            Usage Guide 📘
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">Features Overview</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
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
        <ol className="mt-6 space-y-3">
          {steps.map((step) => (
            <li key={step.text} className={`rounded-2xl p-4 md:p-5 text-sm md:text-base ${theme.cardBackground}`}>
              <span className="font-semibold">
                {step.icon} {step.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-10">
        <h2 className="text-2xl md:text-3xl font-semibold">How to Install as App</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className={`rounded-2xl p-6 ${theme.cardBackground}`}>
            <p className="text-lg font-semibold">🤖 Android</p>
            <p className={`mt-2 text-sm ${theme.secondaryText}`}>Chrome → Menu (⋮) → Install App / Add to Home Screen.</p>
          </article>
          <article className={`rounded-2xl p-6 ${theme.cardBackground}`}>
            <p className="text-lg font-semibold">🍎 iPhone</p>
            <p className={`mt-2 text-sm ${theme.secondaryText}`}>Safari → Share (⬆️) → Add to Home Screen.</p>
          </article>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-20">
        <div className={`rounded-3xl p-6 md:p-8 text-white bg-gradient-to-r ${theme.accentGradient}`}>
          <h2 className="text-2xl md:text-3xl font-semibold">Why This Is Special</h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed text-white/95">
            This is more than a page. It is a time capsule of your relationship made to be revisited, remembered, and
            felt again.
          </p>
        </div>
      </section>
    </div>
  );
}
