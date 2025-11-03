
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

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
          return (
            <span key={index} className="relative inline-block">
              <span className="blur-sm select-none" aria-hidden="true">
                {part}
              </span>
               <span className="absolute left-0 top-0 font-semibold">{part[0]}</span>
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
