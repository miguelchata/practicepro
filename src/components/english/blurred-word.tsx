
'use client';

import React from 'react';

type BlurredWordProps = {
  sentence: string;
  wordToBlur: string;
  showFullWord: boolean;
};

export const BlurredWord = ({ sentence, wordToBlur, showFullWord }: BlurredWordProps) => {
  const regex = new RegExp(`\\b(${wordToBlur})\\b`, 'gi');
  const parts = sentence.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        if (part.toLowerCase() === wordToBlur.toLowerCase()) {
          if (showFullWord) {
            return <strong key={index} className="text-foreground font-semibold">{part}</strong>;
          }
          const shapes = '■'.repeat(part.length - 1);
          return (
            <span key={index} className="font-mono tracking-widest text-muted-foreground/70">
              <span className="font-semibold text-foreground">{part[0]}</span>{shapes}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
