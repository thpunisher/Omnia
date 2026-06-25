import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signalAppReady } from "@/shared/lib/splash";

interface AppEntranceProps {
  children: React.ReactNode;
}

/**
 * Plays a brief entrance animation on first mount, then signals the Tauri
 * splashscreen to close and reveal the (now-maximized) main window right as
 * the animation begins — so the OS window appearing and the in-app reveal
 * feel like one continuous motion instead of two separate jumps.
 */
export const AppEntrance = ({ children }: AppEntranceProps) => {
  const [phase, setPhase] = useState<"mark" | "revealing" | "done">("mark");

  useEffect(() => {
    // Let the logo mark animation play for a beat, then tell the backend
    // to swap from the splashscreen to the (maximized) main window right
    // as the in-app reveal kicks off.
    const t1 = setTimeout(() => {
      setPhase("revealing");
      signalAppReady();
    }, 450);

    const t2 = setTimeout(() => setPhase("done"), 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {phase !== "done" && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "var(--color-base)" }}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <motion.div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--color-accent)" }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={
                phase === "revealing"
                  ? { scale: 1.15, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: phase === "revealing" ? 0.5 : 0.4, ease: "easeOut" }}
            >
              <span className="text-xl font-black text-white select-none">O</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.45 }}
      >
        {children}
      </motion.div>
    </>
  );
};
