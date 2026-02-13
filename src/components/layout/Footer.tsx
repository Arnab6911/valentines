import { useTheme } from "@/contexts/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`w-full border-t ${theme.divider}`}>
      <div className="mx-auto w-full max-w-screen-lg px-4 py-8 text-center">
        <p className={`text-xs leading-relaxed ${theme.secondaryText}`}>
          © 2026 Valentine suprises
        </p>
        <p className={`text-xs leading-relaxed ${theme.secondaryText}`}>
          Made by Arnab Kumar Bhowmik
        </p>
      </div>
    </footer>
  );
}
