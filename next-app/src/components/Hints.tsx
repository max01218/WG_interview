import React from 'react';

interface HintsProps {
    hints: string[];
    onSpeak: (text: string | string[]) => void;
}

export default function Hints({ hints, onSpeak }: HintsProps) {
    const [flipped, setFlipped] = React.useState<{ [key: number]: boolean }>({});

    const toggleFlip = (index: number) => {
        setFlipped(prev => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="hints-section">
            <div className="hints-header">
                <h2>Hints</h2>
                <button
                    id="tts-btn"
                    className="icon-btn"
                    title="Read Hints"
                    onClick={() => onSpeak(hints)}
                >
                    🔊
                </button>
            </div>
            <ul id="hints-list">
                {hints.map((hint, index) => (
                    <li
                        key={index}
                        className={`hint-card ${flipped[index] ? 'flipped' : ''}`}
                        onClick={() => toggleFlip(index)}
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
