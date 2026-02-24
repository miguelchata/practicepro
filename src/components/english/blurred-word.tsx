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
  if (!wordToBlur || !sentence) return <>{sentence}</>;

  const trimmedWord = wordToBlur.trim();
  const escapedWord = escapeRegExp(trimmedWord);
  
  // Create a regex that matches the word or phrase literals. 
  // We use a capture group to keep the match in the split array.
  const regex = new RegExp(`(${escapedWord})`, 'gi');
  const parts = sentence.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Check if this part of the split sentence is the word/phrase we want to blur
        if (part.toLowerCase() === trimmedWord.toLowerCase()) {
          if (showFullWord) {
            return <strong key={index} className="text-foreground font-semibold">{part}</strong>;
          }
          
          // Split the matching phrase into individual words and whitespace
          const subParts = part.split(/(\s+)/);
          
          return (
            <span key={index} className="font-mono text-muted-foreground/70">
              {subParts.map((sub, sIdx) => {
                // Return whitespace characters literally
                if (/^\s+$/.test(sub)) {
                  return <React.Fragment key={sIdx}>{sub}</React.Fragment>;
                }
                
                // For each actual word in the phrase, reveal only the first letter
                if (sub.length > 0) {
                  return (
                    <React.Fragment key={sIdx}>
                      <span className="font-semibold text-foreground">{sub[0]}</span>
                      {sub.slice(1).split('').map((_, charIdx) => (
                        <span key={charIdx} className="opacity-40 px-[1px]">■</span>
                      ))}
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </span>
          );
        }
        // Return parts of the sentence that are NOT the target word/phrase
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
