import { AnimatePresence, motion } from "framer-motion";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Creator from "@/pages/Creator";
import HowItWorks from "@/pages/HowItWorks";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import Viewer from "@/pages/Viewer";

function AppLayout() {
  const location = useLocation();
  const isViewerRoute = location.pathname.startsWith("/viewer/");
  const showFooter =
    location.pathname === "/" ||
    location.pathname === "/creator" ||
    location.pathname === "/about" ||
    location.pathname === "/how-it-works" ||
    isViewerRoute;

  return (
    <div className="min-h-screen">
      {!isViewerRoute && <Navbar />}
      <main className={isViewerRoute ? "min-h-screen" : "pt-16"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen" />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/creator"
          element={
            <RequireAuth>
              <Creator />
            </RequireAuth>
          }
        />
        <Route
          path="/viewer/:id"
          element={
            <RequireAuth>
              <Viewer />
            </RequireAuth>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
