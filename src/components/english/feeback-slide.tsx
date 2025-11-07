import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type FeedbackSlideProps = {
  items: string[];
  duration: number;
  onFinish?: () => void;
};

export const FeedbackSlide = ({
  items,
  duration,
  onFinish,
}: FeedbackSlideProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setTimeout(() => {
      if (currentIndex < items.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onFinish?.();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex, items.length, duration, onFinish]);

  if (items.length === 0) return null;

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center w-full h-full"
        >
          <div className="text-normal font-bold text-gray-800">
            {items[currentIndex]}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
