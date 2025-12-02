import React from 'react';

interface StartScreenProps {
    categories: string[];
    onStart: (category: string, difficulty: string) => void;
    onOpenAdmin: () => void;
}

export default function StartScreen({ categories, onStart, onOpenAdmin }: StartScreenProps) {
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

            <button
                className="admin-btn"
                onClick={onOpenAdmin}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid #ddd',
                    borderRadius: '30px',
                    color: '#555',
                    fontSize: '1rem',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    fontWeight: 'bold'
                }}
            >
                Teacher Mode 👩‍🏫
            </button>
        </div>
    );
}
