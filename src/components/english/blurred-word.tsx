'use client';

import React from 'react';

type BlurredWordProps = {
  sentence: string;
  wordToBlur: string;
  showFullWord: boolean;
};

/**
 * Escapes special characters for use in a regular expression.
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const BlurredWord = ({ sentence, wordToBlur, showFullWord }: BlurredWordProps) => {
  if (!wordToBlur) return <>{sentence}</>;

  // Escape the word to prevent crashes with special regex characters
  const escapedWord = escapeRegExp(wordToBlur);
  
  // Using word boundaries to avoid matching parts of other words (e.g., "car" in "carpet")
  const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');
  const parts = sentence.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLowerCase() === wordToBlur.toLowerCase()) {
          if (showFullWord) {
            return <strong key={index} className="text-foreground font-semibold">{part}</strong>;
          }
          
          // Blur logic: show first letter, then blur the rest but keep spaces/symbols visible
          return (
            <span key={index} className="font-mono tracking-widest text-muted-foreground/70">
              <span className="font-semibold text-foreground">{part[0]}</span>
              {part.slice(1).split('').map((char, charIdx) => {
                // Keep spaces as spaces, replace everything else with a block
                if (char === ' ') return <span key={charIdx}>&nbsp;</span>;
                return <span key={charIdx}>■</span>;
              })}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
