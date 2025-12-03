import React, { useState } from 'react';

interface HintsProps {
    hints: string[];
    revealedIndices: Set<number>;
    onRevealHint: (index: number) => void;
    onSpeak: (text: string | string[]) => void;
}

export default function Hints({ hints, revealedIndices, onRevealHint, onSpeak }: HintsProps) {
    return (
        <div className="hints-section">
            <div className="hints-header">
                <h2>Hints</h2>
                <button
                    id="tts-btn"
                    className="icon-btn"
                    title="Read Hints"
                    onClick={() => {
                        const revealedHints = hints.filter((_, i) => revealedIndices.has(i));
                        if (revealedHints.length > 0) {
                            onSpeak(revealedHints);
                        }
                    }}
                >
                    🔊
                </button>
            </div>
            <ul id="hints-list">
                {hints.map((hint, index) => (
                    <li
                        key={index}
                        className={`hint-card ${revealedIndices.has(index) ? 'flipped' : ''}`}
                        onClick={() => onRevealHint(index)}
                    >
                        <div className="hint-card-inner">
                            <div className="hint-card-front">Hint {index + 1}</div>
                            <div className="hint-card-back">{hint}</div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
