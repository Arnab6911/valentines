import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/lib/firebase";

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function Auth() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/creator");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/creator");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Signup failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${theme.background}`}>
      <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
        <div className={`${theme.cardBackground} ${theme.glowColor} p-8 rounded-2xl w-full max-w-md text-center ${theme.primaryText}`}>
          <h2 className={`text-4xl font-handwritten mb-6 text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}>
            Login / Signup
          </h2>

        {error && <p className={`mb-3 text-sm ${theme.secondaryText}`}>{error}</p>}

        <input
          className={`w-full mb-3 p-2 rounded-lg border ${theme.inputBackground} ${theme.inputText}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className={`w-full mb-4 p-2 rounded-lg border ${theme.inputBackground} ${theme.inputText}`}
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin} disabled={loading} className={`w-full mb-2 py-2 min-h-[44px] rounded-lg ${theme.buttonPrimary}`}>
          Login
        </button>

        <button onClick={handleSignup} disabled={loading} className={`w-full py-2 min-h-[44px] rounded-lg ${theme.buttonSecondary}`}>
          Sign Up
        </button>
      </div>
      </div>
    </div>
  );
}
