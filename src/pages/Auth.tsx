import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { auth } from "@/lib/firebase";

function getAuthErrorMessage(error: unknown, fallback: string) {
  const firebaseCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const readableMessages: Record<string, string> = {
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "This email is already in use.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/popup-closed-by-user": "Google sign-in was canceled.",
    "auth/popup-blocked": "Popup blocked by browser. Please allow popups and try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };

  if (firebaseCode && readableMessages[firebaseCode]) {
    return readableMessages[firebaseCode];
  }

  if (error instanceof Error && error.message) {
    return error.message.replace(/^Firebase:\s*/i, "");
  }

  return fallback;
}

export default function Auth() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | "google" | "reset" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);

  const googleProvider = useMemo(() => new GoogleAuthProvider(), []);
  const isBusy = loadingAction !== null || authLoading;

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/creator");
    }
  }, [authLoading, navigate, user]);

  const handleLogin = async () => {
    setError("");
    setSuccess("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoadingAction("login");
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess("Login successful.");
      navigate("/creator");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Login failed"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSignup = async () => {
    setError("");
    setSuccess("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoadingAction("signup");
      await createUserWithEmailAndPassword(auth, email, password);
      setSuccess("Account created successfully.");
      navigate("/creator");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Signup failed"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    try {
      setLoadingAction("google");
      await signInWithPopup(auth, googleProvider);
      setSuccess("Google sign-in successful.");
      navigate("/creator");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Google sign-in failed"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSendResetLink = async () => {
    setError("");
    setSuccess("");
    if (!email.trim()) {
      setError("Enter your email first to receive a reset link.");
      return;
    }

    try {
      setLoadingAction("reset");
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess("Reset link sent! Check your email.");
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err, "Could not send reset email"));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 ${theme.background}`}>
      <div className="w-full max-w-screen-lg mx-auto flex items-center justify-center">
        <div className={`${theme.cardBackground} ${theme.glowColor} p-8 rounded-2xl w-full max-w-md text-center ${theme.primaryText}`}>
          <h2 className={`text-4xl font-handwritten mb-6 text-transparent bg-clip-text bg-gradient-to-r ${theme.accentGradient}`}>
            Login / Signup
          </h2>

        {error && <p className={`mb-3 text-sm ${theme.secondaryText}`}>Error: {error}</p>}
        {success && <p className={`mb-3 text-sm ${theme.secondaryText}`}>{success}</p>}

        <input
          className={`w-full mb-3 p-2 rounded-lg border ${theme.inputBackground} ${theme.inputText}`}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isBusy}
        />

        <input
          type="password"
          className={`w-full mb-4 p-2 rounded-lg border ${theme.inputBackground} ${theme.inputText}`}
          placeholder="Password (min 6 chars)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isBusy}
        />

        <button
          type="button"
          onClick={() => setShowResetPassword((prev) => !prev)}
          disabled={isBusy}
          className={`w-full text-left mb-4 text-sm underline ${theme.secondaryText}`}
        >
          Forgot Password?
        </button>

        {showResetPassword && (
          <button
            onClick={handleSendResetLink}
            disabled={isBusy}
            className={`w-full mb-3 py-2 min-h-[44px] rounded-lg ${theme.buttonSecondary}`}
          >
            {loadingAction === "reset" ? "Sending reset link..." : "Send Reset Link"}
          </button>
        )}

        <button
          onClick={handleLogin}
          disabled={isBusy}
          className={`w-full mb-2 py-2 min-h-[44px] rounded-lg ${theme.buttonPrimary}`}
        >
          {loadingAction === "login" ? "Logging in..." : "Login"}
        </button>

        <button
          onClick={handleSignup}
          disabled={isBusy}
          className={`w-full mb-3 py-2 min-h-[44px] rounded-lg ${theme.buttonSecondary}`}
        >
          {loadingAction === "signup" ? "Creating account..." : "Sign Up"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isBusy}
          className={`w-full py-2 min-h-[44px] rounded-lg border ${theme.inputBackground} ${theme.inputText}`}
        >
          {loadingAction === "google" ? "Signing in with Google..." : "Continue with Google"}
        </button>
      </div>
      </div>
    </div>
  );
}
