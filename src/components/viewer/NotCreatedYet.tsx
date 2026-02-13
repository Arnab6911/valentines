import { useTheme } from "@/contexts/ThemeContext";

export default function NotCreatedYet() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${theme.background}`}>
      <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
        <div className={`w-full max-w-lg text-center rounded-3xl p-6 md:p-8 ${theme.cardBackground} ${theme.glowColor}`}>
          <h2 className={`text-2xl md:text-3xl font-semibold mb-3 ${theme.primaryText}`}>Nothing here yet</h2>
          <p className={theme.secondaryText}>Someone special needs to create this Valentine first.</p>
        </div>
      </div>
    </div>
  );
}
