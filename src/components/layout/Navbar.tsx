import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "firebase/auth";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/lib/firebase";
import logo from "../../../logo.png";

const navItems = [
  { to: "/", label: "Landing" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/about", label: "About" },
  { to: "/creator", label: "Creator" },
];

export default function Navbar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      setMobileOpen(false);
      navigate("/");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${theme.cardBackground} ${theme.divider}`}>
      <div className="mx-auto w-full max-w-screen-lg px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center">
            <img
              src={logo}
              alt="Surprise Gift"
              className="h-10 w-auto object-contain md:h-12 hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? theme.primaryText : theme.secondaryText}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${theme.buttonSecondary} hover:opacity-90`}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <Link
                to="/auth"
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${theme.buttonPrimary}`}
              >
                Get Started
              </Link>
            )}
          </nav>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`inline-flex md:hidden items-center justify-center h-10 w-10 rounded-lg ${theme.buttonSecondary}`}
          >
            <span className="text-lg">{mobileOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={`md:hidden border-t ${theme.divider}`}
          >
            <div className="mx-auto w-full max-w-screen-lg px-4 py-3 flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? theme.primaryText : theme.secondaryText}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className={`mt-1 rounded-lg px-3 py-2 text-sm font-medium text-center ${theme.buttonSecondary} hover:opacity-90`}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className={`mt-1 rounded-lg px-3 py-2 text-sm font-semibold text-center ${theme.buttonPrimary}`}
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
