import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "../ui/progress";

type FeedbackSlideProps = {
  items: string[];
  duration: number;
  onFinish?: () => void;
  progress?: number;
};

export const FeedbackSlide = ({
  items,
  duration,
  onFinish,
  progress,
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
    <div className="relative w-full h-24 overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center w-full h-full"
        >
            <div className="w-full px-4 space-y-2">
                <div className="text-sm font-medium text-gray-800 text-center">
                    {items[currentIndex]}
                </div>
                {progress !== undefined && <Progress value={progress} />}
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
