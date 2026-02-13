import { useTheme } from "@/contexts/ThemeContext";

export default function About() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.background} ${theme.primaryText}`}>
      <section className="mx-auto w-full max-w-screen-lg px-4 py-16 md:py-24">
        <p className={`text-xs md:text-sm uppercase tracking-[0.22em] ${theme.secondaryText}`}>About Surprise Gift</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">A focused product for heartfelt digital moments.</h1>
        <p className={`mt-6 max-w-3xl text-base md:text-lg leading-relaxed ${theme.secondaryText}`}>
          Surprise Gift is designed like a lightweight SaaS flow: clear creator tools, polished viewer delivery, and clean data handling on Firebase.
          The product intentionally prioritizes readability, performance, and predictable UX over noisy visual effects.
        </p>
      </section>
    </div>
  );
}
