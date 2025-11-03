
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
          const dashes = '—'.repeat(part.length - 1);
          return (
            <span key={index} className="font-mono tracking-wider">
              <span className="font-semibold">{part[0]}</span>{dashes}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
