import React from 'react';

interface WordDisplayProps {
    word: string;
    revealedLetters: { [key: number]: string };
    difficulty: string;
}

export default function WordDisplay({ word, revealedLetters, difficulty }: WordDisplayProps) {
    return (
        <div className="word-display" id="word-display">
            {word.split('').map((letter, index) => {
                let content = '';
                // Easy Mode: Show first letter
                if (difficulty === 'easy' && index === 0) {
                    content = letter;
                } else if (revealedLetters[index]) {
                    content = revealedLetters[index];
                }

                return (
                    <span
                        key={index}
                        className="letter-box"
                        style={{
                            borderColor: revealedLetters[index] ? '#3498DB' : 'var(--text-color)'
                        }}
                    >
                        {content}
                    </span>
                );
            })}
        </div>
    );
}
