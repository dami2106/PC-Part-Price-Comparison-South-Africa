import { AnimatePresence, motion } from "framer-motion";
import { useLocation, HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import HomePage from "./pages/HomePage";
import BuildPage from "./pages/BuildPage";
import CommunityPage from "./pages/CommunityPage";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        style={{ minHeight: "100vh" }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/build/:id" element={<BuildPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AnimatedRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2500,
          style: {
            background: "var(--c-card)",
            color: "var(--c-text-1)",
            border: "1px solid var(--c-border)",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          },
        }}
      />
    </HashRouter>
  );
}
