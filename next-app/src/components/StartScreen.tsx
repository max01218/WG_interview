import React from 'react';

interface StartScreenProps {
    categories: string[];
    onStart: (category: string, difficulty: string) => void;
}

export default function StartScreen({ categories, onStart }: StartScreenProps) {
    return (
        <div id="start-screen" className="card">
            <h2>Halloween Challenge 🎃</h2>
            <p className="subtitle">Can you guess all the spooky words?</p>

            <button
                id="start-game-btn"
                onClick={() => onStart('Halloween', 'easy')}
            >
                Start Game!
            </button>
        </div>
    );
}
