import { useTheme } from "@/contexts/ThemeContext";

const steps = [
  {
    title: "Create",
    detail: "Sign in and build your Valentine page from the creator dashboard.",
  },
  {
    title: "Personalize",
    detail: "Add message, images, relationship start date, timeline entries, and theme.",
  },
  {
    title: "Share",
    detail: "Copy your private viewer link and send it to the person you love.",
  },
  {
    title: "Celebrate",
    detail: "Viewer goes through intro, question, celebration, and memories with smooth transitions.",
  },
];

export default function HowItWorks() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.primaryText}`}>
      <section className="mx-auto w-full max-w-screen-lg px-4 py-16 md:py-24">
        <p className={`text-xs md:text-sm uppercase tracking-[0.22em] ${theme.secondaryText}`}>How It Works</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">Four steps from idea to reveal.</h1>

        <div className="mt-10 space-y-4">
          {steps.map((step, index) => (
            <article key={step.title} className={`rounded-2xl p-6 ${theme.cardBackground} ${theme.glowColor}`}>
              <p className={`text-sm ${theme.secondaryText}`}>Step {index + 1}</p>
              <h2 className="mt-1 text-2xl font-semibold">{step.title}</h2>
              <p className={`mt-2 text-sm md:text-base leading-relaxed ${theme.secondaryText}`}>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
