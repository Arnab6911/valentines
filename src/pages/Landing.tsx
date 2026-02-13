import { Link } from "react-router-dom";

import { useTheme } from "@/contexts/ThemeContext";

export default function Landing() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.primaryText}`}>
      <section className="mx-auto w-full max-w-screen-lg px-4 py-16 md:py-24">
        <p className={`text-xs md:text-sm uppercase tracking-[0.22em] ${theme.secondaryText}`}>
          Valentine Experience Studio
        </p>
        <h1 className="mt-4 text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
          Build a private romantic experience that feels premium.
        </h1>
        <p className={`mt-6 max-w-2xl text-base md:text-lg leading-relaxed ${theme.secondaryText}`}>
          Create, personalize, and share a single secure page with message, memories, relationship timer, and journey timeline.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <Link to="/auth" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonPrimary}`}>
            Create Valentine
          </Link>
          <Link to="/how-it-works" className={`rounded-xl px-6 py-3 text-center font-semibold ${theme.buttonSecondary}`}>
            See How It Works
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-lg px-4 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          <div className={`rounded-2xl p-6 ${theme.cardBackground} ${theme.glowColor}`}>
            <h2 className="text-lg font-semibold">Creator Workspace</h2>
            <p className={`mt-2 text-sm ${theme.secondaryText}`}>
              Add message, photos, timeline entries, relationship start date, and theme in one dashboard.
            </p>
          </div>
          <div className={`rounded-2xl p-6 ${theme.cardBackground} ${theme.glowColor}`}>
            <h2 className="text-lg font-semibold">Viewer Experience</h2>
            <p className={`mt-2 text-sm ${theme.secondaryText}`}>
              Guided stage flow with celebration, timer, slideshow, and timeline for a polished reveal.
            </p>
          </div>
          <div className={`rounded-2xl p-6 ${theme.cardBackground} ${theme.glowColor}`}>
            <h2 className="text-lg font-semibold">Firebase Backed</h2>
            <p className={`mt-2 text-sm ${theme.secondaryText}`}>
              Authentication, Firestore data, and Storage uploads remain in your current pipeline.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
