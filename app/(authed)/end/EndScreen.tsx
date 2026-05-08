"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function EndScreen() {
  const router = useRouter();

  function close() {
    if (typeof window !== "undefined") {
      // PWA: try to close the window. Fallback: route home.
      window.close();
    }
    router.push("/now");
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-prose text-center space-y-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="font-display italic text-2xl md:text-3xl text-ink leading-relaxed"
        >
          That was here. Now this is here.
        </motion.p>

        <button
          type="button"
          onClick={close}
          className="rounded-sm bg-ink text-paper py-3 px-8 font-sans font-medium hover:bg-accent transition-colors"
        >
          Close
        </button>
      </div>
    </main>
  );
}
