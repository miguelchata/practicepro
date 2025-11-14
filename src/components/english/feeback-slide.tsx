import { useState, useEffect, useRef, useCallback } from "react";
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
  // refs for timers / guards
  const timerRef = useRef<number | null>(null);
  const safetyRef = useRef<number | null>(null);
  const animationCompleteRef = useRef(false);
  const finishedRef = useRef(false);

  // cleanup helper
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  }, []);

  // when items array changes, reset to first slide and clear timers
  useEffect(() => {
    clearTimers();
    finishedRef.current = false;
    animationCompleteRef.current = false;
    setCurrentIndex(0);
    return () => {
      clearTimers();
      finishedRef.current = true;
    };
  }, [items, clearTimers]);

  // start the visible timer only after enter animation completes
  // Framer Motion will call onAnimationComplete when animate finishes
  // In case onAnimationComplete doesn't fire (edge cases), we also set a safety fallback.
  const onEnterAnimationComplete = useCallback(() => {
    // mark that the animation finished
    animationCompleteRef.current = true;

    // clear any existing timers (shouldn't be set, but safe)
    clearTimers();

    // Start timer for item visible duration
    timerRef.current = window.setTimeout(() => {
      // advance or finish
      if (currentIndex < items.length - 1) {
        // advance to next item
        // reset animationCompleteRef so next mount waits for its animation
        animationCompleteRef.current = false;
        setCurrentIndex((c) => c + 1);
      } else {
        // last item finished visible duration -> call onFinish once
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinish?.();
        }
      }
    }, duration);

    // safety fallback: in case timer doesn't fire (very unlikely), force finish slightly after duration + 2s
    safetyRef.current = window.setTimeout(() => {
      if (!finishedRef.current) {
        finishedRef.current = true;
        clearTimers();
        onFinish?.();
      }
    }, duration + 2000);
  }, [clearTimers, currentIndex, duration, items.length, onFinish]);

  // Cleanup when unmount
  useEffect(() => {
    return () => {
      clearTimers();
      finishedRef.current = true;
    };
  }, [clearTimers]);

  if (!items || items.length === 0) return null;

  // useEffect(() => {
  //   if (items.length === 0) return;

  //   const timer = setTimeout(() => {
  //     if (currentIndex < items.length - 1) {
  //       setCurrentIndex((prev) => prev + 1);
  //     } else {
  //       onFinish?.();
  //     }
  //   }, duration);

  //   return () => clearTimeout(timer);
  // }, [currentIndex, items.length, duration, onFinish]);

  // if (items.length === 0) return null;

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
          onAnimationComplete={onEnterAnimationComplete}
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
