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
  
  // Use capture group (\b...\b) so split() includes the match in the array.
  // This correctly matches whole words and phrases.
  const regex = new RegExp(`(\\b${escapedWord}\\b)`, 'gi');
  const parts = sentence.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Match the target word/phrase case-insensitively
        if (part.toLowerCase() === trimmedWord.toLowerCase()) {
          if (showFullWord) {
            return <strong key={index} className="text-foreground font-semibold">{part}</strong>;
          }
          
          // Split the phrase into words and whitespace so we can hint each word
          const subParts = part.split(/(\s+)/);
          
          return (
            <span key={index} className="font-mono tracking-widest text-muted-foreground/70">
              {subParts.map((sub, sIdx) => {
                // Preserve literal spaces as non-breaking spaces
                if (/^\s+$/.test(sub)) {
                  return <React.Fragment key={sIdx}>&nbsp;</React.Fragment>;
                }
                
                // For each word in the phrase, show the first letter and blur the rest
                if (sub.length > 0) {
                  return (
                    <React.Fragment key={sIdx}>
                      <span className="font-semibold text-foreground">{sub[0]}</span>
                      {sub.slice(1).split('').map((char, charIdx) => (
                        <span key={charIdx}>■</span>
                      ))}
                    </React.Fragment>
                  );
                }
                return null;
              })}
            </span>
          );
        }
        // Return surrounding sentence text as is
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
