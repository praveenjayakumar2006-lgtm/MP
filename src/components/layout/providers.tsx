
'use client';

import { motion, AnimatePresence } from 'framer-motion';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
  );
}
